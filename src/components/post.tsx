"use client"

import { ExtendedPost } from "@/types"
import { forwardRef, useRef } from "react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { formatRelativeDate } from "@/lib/utils"
import { ArrowBigDown, ArrowBigUp, MessageSquare } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Toggle } from "@/components/ui/toggle"
import { useSession } from "next-auth/react"
import { VoteType } from "@prisma/client"
import { CreateCommentForm } from "@/components/forms/create-comment-form"
import { CommentsSection } from "@/components/comments-section"

type PostProps = {
    post: ExtendedPost
    onVote: ({
        voteType,
        postId,
    }: {
        voteType: VoteType
        postId: string
    }) => void
} & React.ComponentPropsWithRef<"article">

const Post = forwardRef<HTMLElement, PostProps>(({ post, onVote }, ref) => {
    const { data: session } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    const communityName = post.community.name

    const contentRef = useRef<HTMLDivElement>(null)

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

    const showComments =
        pathname.includes("/post") || pathname.includes("/sign-")

    return (
        <Card
            asChild
            className="overflow-hidden p-0 shadow-sm md:p-0"
        >
            <article
                ref={ref}
                key={post.id}
            >
                <div className="flex gap-3 p-4">
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
                                className={upVoted ? "stroke-accent" : ""}
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
                                className={downVoted ? "stroke-secondary" : ""}
                            />
                        </Toggle>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-3">
                            <header>
                                <Link
                                    className="underline hover:no-underline"
                                    href={`/c/${communityName}`}
                                >
                                    c/{communityName}
                                </Link>{" "}
                                •{" "}
                                <span className="text-sm text-primary/50">
                                    Posted by u/{post.author.name}{" "}
                                    <UserAvatar
                                        user={post.author}
                                        className="mr-1 inline-block h-6 w-6 align-middle"
                                    />
                                    {formatRelativeDate(post.createdAt)}
                                </span>
                            </header>
                            <h3 className="text-xl">
                                <Link
                                    href={`/c/${communityName}/post/${post.id}`}
                                >
                                    {post.title}
                                </Link>
                            </h3>
                        </div>
                        <div
                            ref={contentRef}
                            className="relative max-h-[200px] overflow-clip text-sm"
                        >
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
                            {(contentRef.current?.clientHeight ?? 0) === 200 ? (
                                <div
                                    aria-hidden={true}
                                    className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent"
                                />
                            ) : null}
                        </div>
                    </div>
                </div>
                {!session && showComments ? (
                    <p className="p-4 text-primary/70">
                        <Link
                            className="underline hover:no-underline"
                            href={"/sign-in"}
                        >
                            Sign in
                        </Link>{" "}
                        to post comments.
                    </p>
                ) : null}
                {showComments && session && (
                    <div className="border-t p-4">
                        <CreateCommentForm postId={post.id} />
                    </div>
                )}
                {showComments && <CommentsSection postId={post.id} />}

                {!showComments && (
                    <div className="bg-neutral px-4 py-3 text-neutral-foreground">
                        <Link
                            href={`/c/${communityName}/post/${post.id}`}
                            className="flex items-center gap-2"
                        >
                            <MessageSquare />
                            {post.comments.length} comments
                        </Link>
                    </div>
                )}
            </article>
        </Card>
    )
})
Post.displayName = "Post"

function PostSkeleton() {
    return (
        <Card
            asChild
            className="overflow-hidden p-0 shadow-sm md:p-0"
        >
            <article>
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
                <div className="flex items-center gap-2 bg-neutral p-5 text-neutral-foreground">
                    <MessageSquare />
                    <Skeleton className="h-4 w-40 bg-primary/20" />
                </div>
            </article>
        </Card>
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

    return (
        <div className="min-h-[15rem] w-full">
            <Image
                fill
                src={data.file.url}
                className="rounded-lg object-cover object-top"
                alt={removeHTMLTags(data.caption) ?? "Discusst post image"}
            />
        </div>
    )
}

function CustomCodeRenderer({ data }: any) {
    return (
        <pre className="rounded-lg bg-[#2d2d2d] p-4">
            <code className="text-sm text-[#cccccc]">{data.code}</code>
        </pre>
    )
}

export { Post, PostSkeleton }
