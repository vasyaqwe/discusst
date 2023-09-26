import { ExtendedPost } from "@/types"
import { forwardRef, useRef } from "react"
import { Card } from "./ui/card"
import Link from "next/link"
import { formatRelativeDate } from "@/lib/utils"
import { MessageSquare } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Skeleton } from "./ui/skeleton"
import { UserAvatar } from "./ui/user-avatar"

type PostProps = {
    post: ExtendedPost
} & React.ComponentPropsWithRef<"article">

const Post = forwardRef<HTMLElement, PostProps>(({ post }, ref) => {
    const communityName = post.community.name

    const contentRef = useRef<HTMLDivElement>(null)

    const router = useRouter()

    return (
        <Card
            asChild
            className=" cursor-pointer overflow-hidden p-0 shadow-sm md:p-0"
        >
            <article
                onClick={() =>
                    router.push(`/c/${communityName}/posts/${post.id}`)
                }
                ref={ref}
                key={post.id}
            >
                <div className="space-y-3 p-5">
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
                    <h3 className="text-xl">{post.title}</h3>
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
                <div className="bg-accent px-5 py-4">
                    <Link
                        href={`/c/${communityName}/posts/${post.id}`}
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

function PostSkeleton() {
    return (
        <Card
            asChild
            className=" cursor-pointer overflow-hidden p-0 shadow-sm md:p-0"
        >
            <article>
                <div className="space-y-5 p-5">
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
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-accent p-5">
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
