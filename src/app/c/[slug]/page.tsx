import { CreatePostCta } from "@/components/create-post-cta"
import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

type PageProps = {
    params: {
        slug: string
    }
}

export default async function Page({ params: { slug } }: PageProps) {
    const session = await getAuthSession()

    const community = await db.community.findFirst({
        where: { name: slug },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                    comments: true,
                    community: true,
                },
            },
        },
    })

    if (!community) notFound()

    return (
        <>
            <CreatePostCta session={session} />
        </>
    )
}
