import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { withErrorHandling } from "@/lib/utils"
import { commentSchema } from "@/lib/validations/comment"
import { NextResponse } from "next/server"
import { commentsQuerySchema } from "@/lib/validations/comment"

export const POST = withErrorHandling(async function (req: Request) {
    const session = await getAuthSession()

    if (!session) {
        return new NextResponse("Unauthorized", {
            status: 401,
        })
    }

    const _body = await req.json()

    const { postId, body, replyToId } = commentSchema.parse(_body)

    await db.comment.create({
        data: {
            authorId: session.user.id,
            postId,
            body,
            replyToId,
        },
    })

    return new NextResponse("OK")
})

export const GET = withErrorHandling(async function (
    req: Request,
    { params: { postId: _postId } }
) {
    const url = new URL(req.url)

    const { limit, page, postId } = commentsQuerySchema.parse({
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
        postId: _postId,
    })

    const comments = await db.comment.findMany({
        take: limit ? +limit : undefined,
        skip: page && limit ? (+page - 1) * +limit : undefined,
        orderBy: [
            {
                replyToId: "asc",
            },
            {
                createdAt: "desc",
            },
        ],
        include: {
            votes: true,
            author: true,
        },
        where: {
            postId,
        },
    })

    return new NextResponse(JSON.stringify(comments))
})
