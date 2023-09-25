import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { withErrorHandling } from "@/lib/utils"
import { postSchema } from "@/lib/validations/post"
import { NextResponse } from "next/server"

export const POST = withErrorHandling(async function (req: Request) {
    const session = await getAuthSession()

    if (!session) {
        return new NextResponse("Unauthorized", {
            status: 401,
        })
    }

    const body = await req.json()

    const { communityId, title, content } = postSchema.parse(body)

    await db.post.create({
        data: {
            authorId: session.user.id,
            communityId,
            title,
            content,
        },
    })

    return new NextResponse("OK")
})
