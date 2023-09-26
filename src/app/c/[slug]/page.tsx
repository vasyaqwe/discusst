import { CreatePostCta } from "@/components/create-post-cta"
import { PostFeed } from "@/components/post-feed"
import { POSTS_INFINITE_SCROLL_COUNT } from "@/config"
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
                orderBy: {
                    createdAt: "desc",
                },
                take: POSTS_INFINITE_SCROLL_COUNT,
            },
        },
    })

    if (!community) notFound()

    return (
        <>
            <CreatePostCta session={session} />
            <PostFeed
                initialPosts={community.posts}
                communityName={community.name}
            />
        </>
    )
}
