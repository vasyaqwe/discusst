import { ExtendedPost } from "@/types"
import { forwardRef } from "react"
import { Card } from "./ui/card"
import Link from "next/link"

type PostProps = {
    post: ExtendedPost
} & React.ComponentPropsWithRef<"article">

export const Post = forwardRef<HTMLElement, PostProps>(({ post }, ref) => {
    const communityName = post.community.name
    return (
        <Card
            asChild
            className="shadow-sm"
        >
            <article
                ref={ref}
                key={post.id}
            >
                <Link
                    className="underline hover:no-underline"
                    href={`/c/${communityName}`}
                >
                    c/{communityName}
                </Link>{" "}
                •{" "}
                <span className="text-sm text-primary/50">
                    Posted by u/{post.author.name}
                </span>
            </article>
        </Card>
    )
})
Post.displayName = "Post"
