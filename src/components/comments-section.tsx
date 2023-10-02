"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { COMMENTS_INFINITE_SCROLL_COUNT, axiosInstance } from "@/config"
import { useIntersection } from "@/hooks/use-intersection"
import { formatRelativeDate } from "@/lib/utils"
import { ExtendedComment } from "@/types"
import { forwardRef, useEffect } from "react"
import { PostSkeleton } from "@/components/post"
import { Spinner } from "@/components/ui/spinner"
import { UserAvatar } from "@/components/ui/user-avatar"

export function CommentsSection({ postId }: { postId: string }) {
    const { isLoading, data, hasNextPage, isFetchingNextPage, fetchNextPage } =
        useInfiniteQuery(
            ["posts", postId, "comments"],
            async ({ pageParam = 1 }) => {
                const { data } = await axiosInstance.get(
                    `/community/posts/${postId}/comments?limit=${COMMENTS_INFINITE_SCROLL_COUNT}&page=${pageParam}`
                )

                return data as ExtendedComment[]
            },
            {
                refetchInterval: 70000,
                getNextPageParam: (lastPage, allPages) => {
                    return lastPage.length ? allPages.length + 1 : undefined
                },
            }
        )

    const { ref, entry } = useIntersection({
        threshold: 0,
        isLoading,
    })

    useEffect(() => {
        if (entry?.isIntersecting && hasNextPage) fetchNextPage()
    }, [entry, hasNextPage, fetchNextPage])

    const comments = data?.pages.flatMap((page) => page) ?? []

    return (
        <>
            {isLoading
                ? Array(COMMENTS_INFINITE_SCROLL_COUNT)
                      .fill("")
                      .map((_, idx) => <PostSkeleton key={idx} />)
                : comments.map((c, idx) => {
                      if (idx === comments.length - 1) {
                          return (
                              <Comment
                                  key={c.id}
                                  ref={ref}
                                  comment={c}
                              />
                          )
                      }

                      return (
                          <Comment
                              key={c.id}
                              comment={c}
                          />
                      )
                  })}
            {isFetchingNextPage && <Spinner className="mx-auto" />}
        </>
    )
}

type CommentProps = {
    comment: ExtendedComment
} & React.ComponentPropsWithRef<"div">

const Comment = forwardRef<HTMLDivElement, CommentProps>(({ comment }, ref) => {
    return (
        <div
            ref={ref}
            key={comment.id}
            className="border-t px-4 py-3"
        >
            <header className="mb-2 font-medium">
                <UserAvatar
                    user={comment.author}
                    className="mr-2 inline-block h-6 w-6 align-middle"
                />
                u/{comment.author.name}{" "}
                <span className="text-sm font-normal text-primary/50">
                    {formatRelativeDate(comment.createdAt)}
                </span>
            </header>
            {comment.body}
        </div>
    )
})
Comment.displayName = "Comment"
