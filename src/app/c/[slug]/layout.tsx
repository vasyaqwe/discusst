import { JoinCommunityToggle } from "@/components/forms/join-community-toggle"
import { Card } from "@/components/ui/card"
import { CommunityHeader } from "@/components/ui/community-header"
import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatDate } from "@/lib/utils"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
    title: "Discusst",
    description: "Discuss it. Discuss everything. Next.js 13 Reddit clone.",
}

type LayoutProps = {
    children: React.ReactNode
    params: { slug: string }
}

export default async function Layout({
    children,
    params: { slug },
}: LayoutProps) {
    const session = await getAuthSession()

    const community = await db.community.findFirst({
        where: { name: slug },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                },
            },
        },
    })

    if (!community) notFound()

    const subscription = !session?.user
        ? undefined
        : await db.subscription.findFirst({
              where: {
                  community: {
                      name: slug,
                  },
                  userId: session.user.id,
              },
          })

    const isSubscribed = !!subscription

    const membersCount = await db.subscription.count({
        where: {
            community: {
                name: slug,
            },
        },
    })

    return (
        <>
            <CommunityHeader name={community?.name} />
            <div className="mt-3 grid gap-4 md:mt-6 md:grid-cols-3 lg:gap-6">
                <div className="flex flex-col gap-5 md:col-span-2">
                    {children}
                </div>
                <Card
                    asChild
                    className="self-start overflow-hidden p-0 md:p-0"
                >
                    <aside className="hidden md:block">
                        <div className="bg-accent p-5 lg:p-6">
                            <h2 className="text-xl text-accent-foreground">
                                About c/{community.name}
                            </h2>
                        </div>
                        <div className="p-5 lg:p-7">
                            <div className="divide-y">
                                <p className="flex justify-between pb-4">
                                    <span className="text-primary/60">
                                        Created
                                    </span>{" "}
                                    {formatDate(community.createdAt)}
                                </p>
                                <p className="flex justify-between py-4">
                                    <span className="text-primary/60">
                                        Members
                                    </span>{" "}
                                    {membersCount}
                                </p>
                            </div>
                            {community.authorId === session?.user.id ? (
                                <p className="pt-4 text-primary/60">
                                    You created this community.
                                </p>
                            ) : (
                                <JoinCommunityToggle
                                    className="mt-2 w-full"
                                    session={session}
                                    communityId={community.id}
                                    communityName={community.name}
                                    isSubscribed={isSubscribed}
                                />
                            )}
                        </div>
                    </aside>
                </Card>
            </div>
        </>
    )
}
