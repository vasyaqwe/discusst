import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { withErrorHandling } from "@/lib/utils"
import { communitySchema } from "@/lib/validations/community"
import { NextResponse } from "next/server"

export const POST = withErrorHandling(async function (req: Request) {
    const session = await getAuthSession()

    if (!session) {
        return new NextResponse("Unauthorized", {
            status: 401,
        })
    }

    const body = await req.json()

    const { name } = communitySchema.parse(body)

    const duplicate = await db.community.findFirst({
        where: {
            name,
        },
    })

    if (duplicate) {
        return new NextResponse(
            JSON.stringify({
                title: "Name you entered is already taken",
                description: "Please choose a different name",
            }),
            {
                status: 409,
            }
        )
    }

    const community = await db.community.create({
        data: {
            name,
            authorId: session.user.id,
        },
    })

    await db.subscription.create({
        data: {
            userId: session.user.id,
            communityId: community.id,
        },
    })

    return new NextResponse(community.name)
})
