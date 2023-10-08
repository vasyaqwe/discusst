import { db } from "@/lib/db"
import { withErrorHandling } from "@/lib/utils"
import { postsQuerySchema } from "@/lib/validations/post"
import { NextResponse } from "next/server"

export const GET = withErrorHandling(async function (req: Request) {
    const url = new URL(req.url)

    const { limit, page, communityName } = postsQuerySchema.parse({
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
        communityName: url.searchParams.get("communityName"),
    })

    const posts = await db.post.findMany({
        take: +limit,
        skip: (+page - 1) * +limit,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            community: true,
            votes: true,
            author: true,
            comments: true,
        },
        where: communityName
            ? {
                  community: {
                      name: communityName,
                  },
              }
            : undefined,
    })

    return new NextResponse(JSON.stringify(posts))
})
