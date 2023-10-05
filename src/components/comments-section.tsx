"use client"

import {
    InfiniteData,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"
import { COMMENTS_INFINITE_SCROLL_COUNT, axiosInstance } from "@/config"
import { useIntersection } from "@/hooks/use-intersection"
import { formatRelativeDate } from "@/lib/utils"
import { ExtendedComment } from "@/types"
import { forwardRef, useEffect, useMemo, useState } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { Spinner } from "@/components/ui/spinner"
import { UserAvatar } from "@/components/ui/user-avatar"
import { CommentVote, VoteType } from "@prisma/client"
import {
    CommentVotePayload,
    CreateCommentPayload,
    commentSchema,
} from "@/lib/validations/comment"
import { toast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { Toggle } from "@/components/ui/toggle"
import { useRouter } from "next/navigation"
import { ArrowBigDown, ArrowBigUp, MessageSquare } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useFormValidation } from "@/hooks/use-form-validation"
import { Textarea } from "@/components/ui/textarea"
import { ErrorMessage } from "@/components/ui/input"

type OnVoteArgs = {
    voteType: VoteType
    commentId: string
}

function CommentsSection({ postId }: { postId: string }) {
    const { data: session } = useSession()

    const allCommentsQueryKey = ["posts", postId, "all-comments"]
    const queryKey = ["posts", postId, "comments"]

    const { data: allComments } = useQuery(
        allCommentsQueryKey,
        async () => {
            const { data } = await axiosInstance.get(
                `/community/posts/${postId}/comments`
            )

            return data as ExtendedComment[]
        },
        {
            refetchInterval: 50000,
        }
    )

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
        async ({ voteType, commentId }: OnVoteArgs) => {
            const payload: CommentVotePayload = {
                voteType,
            }

            await axiosInstance.patch(
                `/community/posts/${postId}/comments/${commentId}/vote`,
                payload
            )
        },
        {
            onMutate: async ({ voteType, commentId }: OnVoteArgs) => {
                // Stop the queries that may affect this operation
                await queryClient.cancelQueries(queryKey)
                await queryClient.cancelQueries(allCommentsQueryKey)

                const prevData =
                    queryClient.getQueryData<InfiniteData<ExtendedComment[]>>(
                        queryKey
                    )
                const prevAllData =
                    queryClient.getQueryData<ExtendedComment[]>(
                        allCommentsQueryKey
                    )

                const updatedVotes = (votes: CommentVote[]): CommentVote[] => {
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

                if (prevAllData) {
                    queryClient.setQueryData<ExtendedComment[]>(
                        allCommentsQueryKey,
                        prevAllData.map((queryComment) =>
                            queryComment.id === commentId
                                ? {
                                      ...queryComment,
                                      votes: updatedVotes(queryComment.votes),
                                  }
                                : queryComment
                        )
                    )
                }

                if (prevData) {
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
                    prevAllData,
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

    const replies = useMemo(() => {
        const group: Record<string, ExtendedComment[]> = {}
        allComments?.forEach((comment) => {
            if (comment.replyToId !== null) {
                group[comment.replyToId] ||= []
                group[comment.replyToId].push(comment)
            }
        })
        return group
    }, [allComments])

    return (
        <div className="flex flex-col">
            {isLoading
                ? Array(COMMENTS_INFINITE_SCROLL_COUNT)
                      .fill("")
                      .map((_, idx) => <CommentSkeleton key={idx} />)
                : comments
                      .filter((comment) => comment.replyToId === null)
                      .map((c, idx) => {
                          return (
                              <Comment
                                  key={c.id}
                                  onVote={onVote}
                                  ref={
                                      idx === comments.length - 1
                                          ? ref
                                          : undefined
                                  }
                                  replies={replies}
                                  comment={c}
                                  postId={postId}
                              />
                          )
                      })}
            {isFetchingNextPage && <Spinner className="mx-auto mb-3" />}
        </div>
    )
}

type CommentProps = {
    comment: ExtendedComment
    postId: string
    onVote: (args: OnVoteArgs) => void
    replies: Record<string, ExtendedComment[]>
} & React.ComponentPropsWithRef<"div">

const Comment = forwardRef<HTMLDivElement, CommentProps>(
    ({ comment, onVote, postId, replies }, ref) => {
        const [formData, setFormData] = useState<CreateCommentPayload>({
            body: "",
            postId,
        })
        const [isReplying, setIsReplying] = useState(false)

        const { data: session } = useSession()
        const router = useRouter()

        const queryClient = useQueryClient()

        const { mutate: onReply, isLoading } = useMutation(
            async (payload: CreateCommentPayload) => {
                const { data } = await axiosInstance.post(
                    `/community/posts/${postId}/comments`,
                    payload
                )

                return data
            },
            {
                onError: () => {
                    toast({
                        title: "Something went wrong.",
                        description: "Could not reply to comment.",
                        variant: "destructive",
                    })
                },
                onSuccess: () => {
                    queryClient.invalidateQueries(["posts", postId, "comments"])
                    queryClient.invalidateQueries([
                        "posts",
                        postId,
                        "all-comments",
                    ])

                    setFormData((prev) => ({ ...prev, body: "" }))
                    setIsReplying(false)

                    toast({
                        title: "Reply created.",
                    })
                },
            }
        )

        async function onSubmit() {
            const payload: CreateCommentPayload = {
                ...formData,
                body: formData.body,
                replyToId: comment.id,
            }
            onReply(payload)
        }

        const { safeOnSubmit, errors } = useFormValidation({
            onSubmit,
            formData,
            zodSchema: commentSchema,
        })

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
                data-noline={
                    isReplying ? false : !replies[comment.id] ? true : false
                }
                data-toplevel={comment.replyToId === null}
                className={`relative flex min-w-[260px] py-3 pl-3 pr-1 before:absolute before:left-[1.45rem] 
                before:top-11 
                before:h-[calc(100%-44px)] before:w-[2px] before:bg-border
           data-[toplevel=false]:overflow-hidden data-[toplevel=true]:overflow-x-auto data-[toplevel=true]:border-t data-[noline=false]:pb-0
           data-[toplevel=false]:pl-6
                     data-[toplevel=false]:before:left-[2.2rem] data-[noline=true]:before:hidden`}
                ref={ref}
            >
                <div className="inline-block h-full w-full">
                    <header className="mb-2 font-medium">
                        <UserAvatar
                            user={comment.author}
                            className="mr-2 inline-block h-6 w-6 align-middle"
                        />
                        u/{comment.author.username}{" "}
                        <span className="text-sm font-normal text-primary/50">
                            {formatRelativeDate(comment.createdAt)}
                        </span>
                    </header>
                    <p className="ml-8">{comment.body}</p>
                    <div className="ml-8 mt-2 flex items-center gap-1">
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
                                className={
                                    upVoted ? "fill-accent stroke-accent" : ""
                                }
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
                                className={
                                    downVoted
                                        ? "fill-secondary stroke-secondary"
                                        : ""
                                }
                            />
                        </Toggle>
                        <Button
                            onClick={() => {
                                if (session) {
                                    setIsReplying(!isReplying)
                                } else {
                                    router.push("/sign-up")
                                }
                            }}
                            size={"xs"}
                            variant={"ghost"}
                            className="text-sm"
                        >
                            <MessageSquare size={18} />
                            Reply
                        </Button>
                    </div>
                    {isReplying && (
                        <div className="ml-8 ">
                            <form
                                className="w-full pb-4 pr-4"
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    safeOnSubmit()
                                }}
                            >
                                <label
                                    htmlFor="reply"
                                    className="my-2 inline-block text-lg font-medium"
                                >
                                    Reply
                                </label>
                                <Textarea
                                    invalid={errors.body}
                                    asChild
                                >
                                    <TextareaAutosize
                                        id="reply"
                                        value={formData.body}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                body: e.target.value,
                                            }))
                                        }
                                        autoFocus
                                        placeholder="Type your reply here..."
                                        className="w-full resize-none "
                                    />
                                </Textarea>
                                {errors.body && (
                                    <ErrorMessage error={errors.body} />
                                )}
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-1">
                                    <Button disabled={isLoading}>
                                        {isLoading && <Spinner />}
                                        Post
                                    </Button>
                                    <Button
                                        onClick={() => setIsReplying(false)}
                                        variant={"outline"}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                    {replies[comment.id]?.map((reply) => (
                        <Comment
                            key={reply.id}
                            replies={replies}
                            onVote={onVote}
                            comment={reply}
                            postId={postId}
                        />
                    ))}
                </div>
            </div>
        )
    }
)
Comment.displayName = "Comment"

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

export { CommentsSection, CommentSkeleton }
