import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { withErrorHandling } from "@/lib/utils"
import { postsQuerySchema } from "@/lib/validations/post"
import { NextResponse } from "next/server"

export const GET = withErrorHandling(async function (req: Request) {
    const url = new URL(req.url)

    const session = await getAuthSession()

    let joinedCommunitiesIds: string[] = []

    if (session) {
        const joinedCommunities = await db.subscription.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                community: true,
            },
        })

        joinedCommunitiesIds = joinedCommunities.map(
            (community) => community.communityId
        )
    }

    const { limit, page, communityName } = postsQuerySchema.parse({
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
        communityName: url.searchParams.get("communityName"),
    })

    let whereClause = {}

    if (communityName) {
        whereClause = {
            community: {
                name: communityName,
            },
        }
    } else if (session && joinedCommunitiesIds.length > 0) {
        whereClause = {
            community: {
                id: {
                    in: joinedCommunitiesIds,
                },
            },
        }
    }

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
        where: whereClause,
    })

    return new NextResponse(JSON.stringify(posts))
})
