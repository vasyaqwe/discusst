import { db } from "@/lib/db"
import { withErrorHandling } from "@/lib/utils"
import { NextResponse } from "next/server"

export const GET = withErrorHandling(async function (req: Request) {
    const url = new URL(req.url)
    const q = url.searchParams.get("q")

    if (!q) return new NextResponse("Invalid query", { status: 400 })

    const results = await db.community.findMany({
        where: {
            name: {
                startsWith: q,
            },
        },
    })

    return new NextResponse(JSON.stringify(results))
})
