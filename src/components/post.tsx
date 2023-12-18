/* eslint-disable @next/next/no-img-element */
"use client"

import { ExtendedPost } from "@/types"
import { forwardRef, useRef } from "react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { formatRelativeDate } from "@/lib/utils"
import { ArrowBigDown, ArrowBigUp, MessageSquare } from "lucide-react"
import dynamic from "next/dynamic"
import { usePathname, useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Toggle } from "@/components/ui/toggle"
import { useSession } from "next-auth/react"
import { VoteType } from "@prisma/client"

type OnVoteArgs = {
    voteType: VoteType
    postId: string
}

type PostProps = {
    post: ExtendedPost
    onVote: ({ voteType, postId }: OnVoteArgs) => void
} & React.ComponentPropsWithRef<"article">

const Post = forwardRef<HTMLElement, PostProps>(({ post, onVote }, ref) => {
    const communityName = post.community.name

    const contentRef = useRef<HTMLDivElement>(null)

    return (
        <Card
            asChild
            className="overflow-hidden p-0 shadow-sm md:p-0"
        >
            <article ref={ref}>
                <div className="flex gap-3 p-3 md:p-4">
                    <PostVotes
                        onVote={onVote}
                        post={post}
                    />
                    <div className="w-[calc(100%-3rem)] space-y-3">
                        <div className="space-y-3">
                            <PostHeader post={post} />
                            <h3 className="text-xl">
                                <Link
                                    href={`/c/${communityName}/post/${post.id}`}
                                >
                                    {post.title}
                                </Link>
                            </h3>
                        </div>
                        {post?.content?.blocks.length > 0 && (
                            <div
                                ref={contentRef}
                                className={`relative max-h-[200px] overflow-clip  text-sm`}
                            >
                                <PostContent post={post} />
                                {(contentRef.current?.clientHeight ?? 0) ===
                                200 ? (
                                    <div
                                        aria-hidden={true}
                                        className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent"
                                    />
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-neutral px-3 py-3 text-neutral-foreground md:px-4">
                    <Link
                        href={`/c/${communityName}/post/${post.id}`}
                        className="flex items-center gap-2"
                    >
                        <MessageSquare />
                        {post.comments.length} comments
                    </Link>
                </div>
            </article>
        </Card>
    )
})
Post.displayName = "Post"

function PostVotes({
    post,
    onVote,
}: {
    post: ExtendedPost
    onVote: ({ voteType, postId }: OnVoteArgs) => void
}) {
    const { data: session } = useSession()
    const router = useRouter()

    const votesAmount = post.votes.reduce((acc, currVote) => {
        if (currVote.type === "UP") return acc + 1
        if (currVote.type === "DOWN") return acc - 1
        return acc
    }, 0)

    const existingVote = post.votes.find(
        (vote) => vote.authorId === session?.user.id
    )

    const upVoted = existingVote && existingVote.type === "UP"
    const downVoted = existingVote && existingVote.type === "DOWN"

    return (
        <div className="flex flex-col items-center gap-1">
            <Toggle
                data-state={upVoted ? "on" : "off"}
                onClick={() => {
                    if (session) {
                        onVote({ voteType: "UP", postId: post.id })
                    } else {
                        router.push("/sign-up")
                    }
                }}
                size={"sm"}
                className="flex-shrink-0"
            >
                <ArrowBigUp
                    size={23}
                    className={upVoted ? "fill-accent stroke-accent" : ""}
                />
            </Toggle>
            {votesAmount}
            <Toggle
                data-state={downVoted ? "on" : "off"}
                onClick={() => {
                    if (session) {
                        onVote({
                            voteType: "DOWN",
                            postId: post.id,
                        })
                    } else {
                        router.push("/sign-up")
                    }
                }}
                size={"sm"}
                className="flex-shrink-0"
            >
                <ArrowBigDown
                    size={23}
                    className={
                        downVoted ? "fill-secondary stroke-secondary" : ""
                    }
                />
            </Toggle>
        </div>
    )
}

function PostHeader({ post }: { post: ExtendedPost }) {
    const communityName = post.community.name
    const pathname = usePathname()

    return (
        <header>
            {!pathname.includes(`/c/${communityName}`) && (
                <>
                    <Link
                        className="underline hover:no-underline"
                        href={`/c/${communityName}`}
                    >
                        c/{communityName}
                    </Link>{" "}
                    •{" "}
                </>
            )}
            <span className="text-sm text-primary/50">
                Posted by u/{post.author.username}{" "}
                <UserAvatar
                    user={post.author}
                    className="mr-1 inline-block h-6 w-6 align-middle"
                />
                {formatRelativeDate(post.createdAt)}
            </span>
        </header>
    )
}

function PostContent({ post }: { post: ExtendedPost }) {
    return (
        <EditorOutput
            renderers={{
                image: CustomImageRenderer,
                code: CustomCodeRenderer,
            }}
            style={{
                paragraph: {
                    fontSize: "0.875rem",
                    lineHeight: "1.2",
                },
            }}
            data={post.content}
        />
    )
}

function PostSkeletonContent() {
    return (
        <div className="flex gap-3 p-5">
            <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-7 w-7 " />
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-7 w-7 " />
            </div>
            <div className="w-full space-y-5">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20 " /> •{" "}
                    <Skeleton className="h-4 w-32 bg-muted/60" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-20 " />
                </div>
                <Skeleton className="h-5 w-1/2 bg-primary/20" />

                <div className="space-y-3">
                    <Skeleton className="h-4 w-[80%]" />
                    <Skeleton className="h-4 w-[85%]" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[95%]" />
                    <Skeleton className="h-4 w-[100%]" />
                </div>
            </div>
        </div>
    )
}

const EditorOutput = dynamic(
    async () => (await import("editorjs-react-renderer")).default,
    {
        ssr: false,
    }
)

function CustomImageRenderer({ data }: any) {
    function removeHTMLTags(input: string) {
        return input.replace(/<\/?[^>]+(>|$)/g, "")
    }

    return data.caption ? (
        <figcaption className="mt-3 w-fit">
            <img
                src={data.file.url}
                className={`rounded-t-lg object-cover object-top ${
                    data.withBorder ? "border" : ""
                }`}
                alt={removeHTMLTags(data.caption)}
            />
            <figure
                className=" rounded-b-lg border border-t-0 bg-white p-2 text-sm"
                dangerouslySetInnerHTML={{ __html: data.caption }}
            ></figure>
        </figcaption>
    ) : (
        <img
            src={data.file.url}
            className={`mt-3 rounded-lg object-cover object-top ${
                data.withBorder ? "border" : ""
            }`}
            alt={"Discusst post image"}
        />
    )
}

function CustomCodeRenderer({ data }: any) {
    return (
        <pre className="mt-3 overflow-auto rounded-lg  bg-[#2d2d2d] p-4">
            <code className="text-sm text-[#cccccc] ">{data.code}</code>
        </pre>
    )
}

export { Post, PostSkeletonContent, PostHeader, PostVotes, PostContent }
