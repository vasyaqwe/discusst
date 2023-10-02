import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { withErrorHandling } from "@/lib/utils"
import { postVoteSchema } from "@/lib/validations/post"
import { NextResponse } from "next/server"

export const PATCH = withErrorHandling(async function (
    req: Request,
    { params: { postId } }
) {
    const session = await getAuthSession()

    if (!session) {
        return new NextResponse("Unauthorized", {
            status: 401,
        })
    }

    const post = await db.post.findFirst({
        where: {
            id: postId,
        },
        select: {
            id: true,
        },
    })

    if (!post) return new NextResponse("Post not found", { status: 404 })

    const body = await req.json()

    const { voteType } = postVoteSchema.parse(body)

    const existingPostVote = await db.postVote.findFirst({
        where: {
            authorId: session.user.id,
            postId,
        },
        select: {
            type: true,
        },
    })

    if (existingPostVote) {
        //delete vote if trying to vote again with the same type
        if (existingPostVote.type === voteType) {
            await db.postVote.delete({
                where: {
                    authorId_postId: {
                        authorId: session.user.id,
                        postId,
                    },
                },
            })

            return new NextResponse("OK")
        }

        //if vote type is different, update with the new vote type
        await db.postVote.update({
            data: {
                type: voteType,
            },
            where: {
                authorId_postId: {
                    authorId: session.user.id,
                    postId,
                },
            },
        })

        return new NextResponse("OK")
    }

    await db.postVote.create({
        data: {
            authorId: session.user.id,
            postId,
            type: voteType,
        },
    })

    return new NextResponse("OK")
})
