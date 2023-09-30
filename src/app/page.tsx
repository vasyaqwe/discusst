import { PostFeed } from "@/components/post-feed"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { POSTS_INFINITE_SCROLL_COUNT } from "@/config"
import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { HomeIcon } from "lucide-react"
import Link from "next/link"

export default async function Home() {
    const session = await getAuthSession()

    const generalPosts = session
        ? []
        : await db.post.findMany({
              orderBy: {
                  createdAt: "desc",
              },
              include: {
                  votes: true,
                  author: true,
                  community: true,
                  comments: true,
              },
              take: POSTS_INFINITE_SCROLL_COUNT,
          })

    const joinedCommunities = !session
        ? []
        : await db.subscription.findMany({
              where: {
                  userId: session?.user.id,
              },
          })

    const customPosts = !session
        ? []
        : await db.post.findMany({
              where: {
                  communityId: {
                      in: joinedCommunities.map((c) => c.communityId),
                  },
              },
              orderBy: {
                  createdAt: "desc",
              },
              include: {
                  votes: true,
                  author: true,
                  community: true,
                  comments: true,
              },
              take: POSTS_INFINITE_SCROLL_COUNT,
          })

    return (
        <>
            <h1 className="text-4xl font-bold">Your feed</h1>
            <div className="mt-3 grid gap-4 md:mt-6 md:grid-cols-3 lg:gap-6">
                <div className="flex flex-col gap-5 md:col-span-2">
                    {session ? (
                        <PostFeed initialPosts={customPosts} />
                    ) : (
                        <PostFeed initialPosts={generalPosts} />
                    )}
                </div>
                <Card className="self-start overflow-hidden p-0 md:p-0">
                    <div className="bg-neutral p-5 lg:p-6">
                        <h2 className="text-neutral-foreground">
                            <HomeIcon className="inline " />{" "}
                            <span className="align-middle">Home</span>
                        </h2>
                    </div>
                    <div className="p-5 lg:p-6">
                        <p>
                            Welcome to the homepage. Check in with your favorite
                            communities here.
                        </p>
                        <Button
                            asChild
                            className="mt-7 w-full xs:w-fit"
                        >
                            <Link href={"/c/create"}>New Community</Link>
                        </Button>
                    </div>
                </Card>
            </div>
        </>
    )
}
