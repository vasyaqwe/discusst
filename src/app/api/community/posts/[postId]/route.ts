import { db } from "@/lib/db"
import { withErrorHandling } from "@/lib/utils"
import { NextResponse } from "next/server"

export const GET = withErrorHandling(async function (
    _req: Request,
    { params: { postId } }
) {
    const post = await db.post.findFirst({
        where: {
            id: postId,
        },
        include: {
            votes: true,
            author: true,
            community: true,
            comments: true,
        },
    })

    return new NextResponse(JSON.stringify(post))
})
