import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { withErrorHandling } from "@/lib/utils"
import { commentVoteSchema } from "@/lib/validations/comment"
import { NextResponse } from "next/server"

export const PATCH = withErrorHandling(async function (
    req: Request,
    { params: { commentId } }
) {
    const session = await getAuthSession()

    if (!session) {
        return new NextResponse("Unauthorized", {
            status: 401,
        })
    }

    const comment = await db.comment.findFirst({
        where: {
            id: commentId,
        },
        select: {
            id: true,
        },
    })

    if (!comment) return new NextResponse("Comment not found", { status: 404 })

    const body = await req.json()

    const { voteType } = commentVoteSchema.parse(body)

    const existingCommentVote = await db.commentVote.findFirst({
        where: {
            authorId: session.user.id,
            commentId,
        },
        select: {
            type: true,
        },
    })

    if (existingCommentVote) {
        //delete vote if trying to vote again with the same type
        if (existingCommentVote.type === voteType) {
            await db.commentVote.delete({
                where: {
                    authorId_commentId: {
                        authorId: session.user.id,
                        commentId,
                    },
                },
            })

            return new NextResponse("OK")
        }

        //if vote type is different, update with the new vote type
        await db.commentVote.update({
            data: {
                type: voteType,
            },
            where: {
                authorId_commentId: {
                    authorId: session.user.id,
                    commentId,
                },
            },
        })

        return new NextResponse("OK")
    }

    await db.commentVote.create({
        data: {
            authorId: session.user.id,
            commentId,
            type: voteType,
        },
    })

    return new NextResponse("OK")
})
