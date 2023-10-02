"use client"

import {
    InfiniteData,
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query"
import { COMMENTS_INFINITE_SCROLL_COUNT, axiosInstance } from "@/config"
import { useIntersection } from "@/hooks/use-intersection"
import { formatRelativeDate } from "@/lib/utils"
import { ExtendedComment } from "@/types"
import { forwardRef, useEffect } from "react"
import { PostSkeleton } from "@/components/post"
import { Spinner } from "@/components/ui/spinner"
import { UserAvatar } from "@/components/ui/user-avatar"
import { CommentVote, VoteType } from "@prisma/client"
import { CommentVotePayload } from "@/lib/validations/comment"
import { toast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { Toggle } from "@/components/ui/toggle"
import { useRouter } from "next/navigation"
import { ArrowBigDown, ArrowBigUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function CommentsSection({ postId }: { postId: string }) {
    const { data: session } = useSession()

    const queryKey = ["posts", postId, "comments"]

    const { isLoading, data, hasNextPage, isFetchingNextPage, fetchNextPage } =
        useInfiniteQuery(
            queryKey,
            async ({ pageParam = 1 }) => {
                const { data } = await axiosInstance.get(
                    `/community/posts/${postId}/comments?limit=${COMMENTS_INFINITE_SCROLL_COUNT}&page=${pageParam}`
                )

                return data as ExtendedComment[]
            },
            {
                refetchInterval: 50000,
                getNextPageParam: (lastPage, allPages) => {
                    return lastPage.length ? allPages.length + 1 : undefined
                },
            }
        )

    const queryClient = useQueryClient()

    const { mutate: onVote } = useMutation(
        async ({
            voteType,
            commentId,
        }: {
            voteType: VoteType
            commentId: string
        }) => {
            const payload: CommentVotePayload = {
                voteType,
            }

            await axiosInstance.patch(
                `/community/posts/${postId}/comments/${commentId}/vote`,
                payload
            )
        },
        {
            onMutate: async ({
                voteType,
                commentId,
            }: {
                voteType: VoteType
                commentId: string
            }) => {
                // Stop the queries that may affect this operation
                await queryClient.cancelQueries(queryKey)

                const prevData =
                    queryClient.getQueryData<InfiniteData<ExtendedComment[]>>(
                        queryKey
                    )

                if (prevData) {
                    const updatedVotes = (
                        votes: CommentVote[]
                    ): CommentVote[] => {
                        const existingCommentVote = votes.find(
                            (vote) =>
                                vote.commentId === commentId &&
                                vote.authorId === session?.user.id
                        )

                        if (existingCommentVote) {
                            //delete vote if trying to vote again with the same type
                            if (existingCommentVote.type === voteType) {
                                return votes.filter((vote) =>
                                    vote.commentId === commentId &&
                                    vote.authorId === session?.user.id
                                        ? undefined
                                        : vote
                                )
                            }

                            //if vote type is different, update with the new vote type
                            return votes.map((vote) =>
                                vote.commentId === commentId &&
                                vote.authorId === session?.user.id
                                    ? { ...vote, type: voteType }
                                    : vote
                            )
                        }

                        return [
                            ...votes,
                            {
                                commentId: commentId,
                                authorId: session?.user.id ?? "",
                                type: voteType,
                            },
                        ]
                    }

                    queryClient.setQueryData<InfiniteData<ExtendedComment[]>>(
                        queryKey,
                        {
                            ...prevData,
                            pages: prevData.pages.map((page) =>
                                page.map((queryComment) =>
                                    queryComment.id === commentId
                                        ? {
                                              ...queryComment,
                                              votes: updatedVotes(
                                                  queryComment.votes
                                              ),
                                          }
                                        : queryComment
                                )
                            ),
                        }
                    )
                }

                return {
                    prevData,
                }
            },
            onError: (_error, _postId, context) => {
                toast({
                    title: "There was an error",
                    description: "Try again in a couple of seconds",
                    variant: "destructive",
                })
                if (context?.prevData) {
                    queryClient.setQueryData(queryKey, context.prevData)
                }
            },
            onSuccess: () => {
                queryClient.invalidateQueries(queryKey)
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
                      .map((_, idx) => <CommentSkeleton key={idx} />)
                : comments.map((c, idx) => {
                      if (idx === comments.length - 1) {
                          return (
                              <Comment
                                  onVote={onVote}
                                  key={c.id}
                                  ref={ref}
                                  comment={c}
                              />
                          )
                      }

                      return (
                          <Comment
                              onVote={onVote}
                              key={c.id}
                              comment={c}
                          />
                      )
                  })}
            {isFetchingNextPage && <Spinner className="mx-auto" />}
        </>
    )
}

function CommentSkeleton() {
    return (
        <div className="space-y-4 border-t px-4 py-3">
            <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3 w-32 bg-primary/20" />
                <Skeleton className="h-3 w-20 bg-muted/60" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-3 w-[90%]" />
                <Skeleton className="h-3 w-[95%]" />
                <Skeleton className="h-3 w-[100%]" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 " />
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-5 w-5 " />
            </div>
        </div>
    )
}

type CommentProps = {
    comment: ExtendedComment
    onVote: ({
        voteType,
        commentId,
    }: {
        voteType: VoteType
        commentId: string
    }) => void
} & React.ComponentPropsWithRef<"div">

const Comment = forwardRef<HTMLDivElement, CommentProps>(
    ({ comment, onVote }, ref) => {
        const { data: session } = useSession()
        const router = useRouter()

        const votesAmount = comment.votes.reduce((acc, currVote) => {
            if (currVote.type === "UP") return acc + 1
            if (currVote.type === "DOWN") return acc - 1
            return acc
        }, 0)

        const existingVote = comment.votes.find(
            (vote) => vote.authorId === session?.user.id
        )

        const upVoted = existingVote && existingVote.type === "UP"
        const downVoted = existingVote && existingVote.type === "DOWN"

        return (
            <div
                ref={ref}
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
                <p>{comment.body}</p>
                <div className="mt-2 flex items-center gap-1">
                    <Toggle
                        data-state={upVoted ? "on" : "off"}
                        onClick={() => {
                            if (session) {
                                onVote({
                                    voteType: "UP",
                                    commentId: comment.id,
                                })
                            } else {
                                router.push("/sign-up")
                            }
                        }}
                        size={"xs"}
                        className="flex-shrink-0"
                    >
                        <ArrowBigUp
                            width={20}
                            height={20}
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
                                    commentId: comment.id,
                                })
                            } else {
                                router.push("/sign-up")
                            }
                        }}
                        size={"xs"}
                        className="flex-shrink-0"
                    >
                        <ArrowBigDown
                            width={20}
                            height={20}
                            className={downVoted ? "stroke-secondary" : ""}
                        />
                    </Toggle>
                </div>
            </div>
        )
    }
)
Comment.displayName = "Comment"
