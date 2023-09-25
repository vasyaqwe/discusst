import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { withErrorHandling } from "@/lib/utils"
import { communitySubscriptionSchema } from "@/lib/validations/community"
import { NextResponse } from "next/server"

export const POST = withErrorHandling(async function (req: Request) {
    const session = await getAuthSession()

    if (!session) {
        return new NextResponse("Unauthorized", {
            status: 401,
        })
    }

    const body = await req.json()

    const { communityId } = communitySubscriptionSchema.parse(body)

    const isSubscribed = await db.subscription.findFirst({
        where: {
            communityId,
            userId: session.user.id,
        },
    })

    if (!isSubscribed) {
        await db.subscription.create({
            data: { communityId, userId: session.user.id },
        })

        return new NextResponse(communityId)
    }

    const userIsCommunityAuthor = await db.community.findFirst({
        where: {
            id: communityId,
            authorId: session.user.id,
        },
    })

    if (userIsCommunityAuthor) {
        return new NextResponse(
            "You can't unsubscribe from a community you created.",
            {
                status: 400,
            }
        )
    }

    await db.subscription.delete({
        where: {
            userId_communityId: {
                communityId,
                userId: session.user.id,
            },
        },
    })

    return new NextResponse(communityId)
})
