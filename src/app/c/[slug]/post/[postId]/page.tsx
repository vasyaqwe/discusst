"use client"

import { CommentSkeleton, CommentsSection } from "@/components/comments-section"
import { CreateCommentForm } from "@/components/forms/create-comment-form"
import {
    PostContent,
    PostHeader,
    PostSkeletonContent,
    PostVotes,
} from "@/components/post"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { COMMENTS_INFINITE_SCROLL_COUNT, axiosInstance } from "@/config"
import { toast } from "@/hooks/use-toast"
import { PostVotePayload } from "@/lib/validations/post"
import { ExtendedPost } from "@/types"
import { PostVote, VoteType } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"

type PageProps = {
    params: {
        postId: string
    }
}

export default function Page({ params: { postId } }: PageProps) {
    const { data: session } = useSession()
    const router = useRouter()

    const queryKey = ["posts", postId]

    const { data: post, isLoading } = useQuery(queryKey, async () => {
        const { data } = await axiosInstance.get(`/community/posts/${postId}`)

        return data as ExtendedPost
    })

    if (!post && !isLoading) notFound()

    const queryClient = useQueryClient()

    const { mutate: onVote } = useMutation(
        async ({ voteType }: { voteType: VoteType }) => {
            const payload: PostVotePayload = {
                voteType,
            }

            await axiosInstance.patch(
                `/community/posts/${postId}/vote`,
                payload
            )
        },
        {
            onMutate: async ({
                voteType,
                postId,
            }: {
                voteType: VoteType
                postId: string
            }) => {
                // Stop the queries that may affect this operation
                await queryClient.cancelQueries(queryKey)

                const prevData =
                    queryClient.getQueryData<ExtendedPost>(queryKey)

                if (prevData && post) {
                    const updatedVotes = (): PostVote[] => {
                        const existingPostVote = post.votes.find(
                            (vote) =>
                                vote.postId === postId &&
                                vote.authorId === session?.user.id
                        )

                        if (existingPostVote) {
                            //delete vote if trying to vote again with the same type
                            if (existingPostVote.type === voteType) {
                                return post.votes.filter((vote) =>
                                    vote.postId === postId &&
                                    vote.authorId === session?.user.id
                                        ? undefined
                                        : vote
                                )
                            }

                            //if vote type is different, update with the new vote type
                            return post.votes.map((vote) =>
                                vote.postId === postId &&
                                vote.authorId === session?.user.id
                                    ? { ...vote, type: voteType }
                                    : vote
                            )
                        }

                        return [
                            ...post.votes,
                            {
                                postId: postId,
                                authorId: session?.user.id ?? "",
                                type: voteType,
                            },
                        ]
                    }

                    queryClient.setQueryData<ExtendedPost>(queryKey, {
                        ...prevData,
                        votes: updatedVotes(),
                    })
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

    return (
        <>
            {isLoading ? (
                <PostSkeleton />
            ) : (
                <div className="relative mt-6 md:mt-0">
                    <Button
                        role="link"
                        variant={"link"}
                        className="absolute -top-10"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft size={18} />
                        Back to community
                    </Button>
                    <Card
                        asChild
                        className="overflow-hidden p-0 shadow-sm md:p-0"
                    >
                        <article>
                            <div className="flex gap-3 p-4">
                                <PostVotes
                                    onVote={onVote}
                                    post={post}
                                />
                                <div className="space-y-3">
                                    <div className="space-y-3">
                                        <PostHeader post={post} />
                                        <h3 className="text-xl">
                                            {post.title}
                                        </h3>
                                    </div>
                                    <div className={`relative text-sm`}>
                                        <PostContent post={post} />
                                    </div>
                                </div>
                            </div>

                            {!session && (
                                <p className="bg-neutral p-4 px-4 py-3 text-neutral-foreground">
                                    <Link
                                        className="underline hover:no-underline"
                                        href={"/sign-in"}
                                    >
                                        Sign in
                                    </Link>{" "}
                                    to post comments.
                                </p>
                            )}

                            {session && (
                                <div className="border-t p-4">
                                    <CreateCommentForm postId={post.id} />
                                </div>
                            )}

                            <CommentsSection postId={post.id} />
                        </article>
                    </Card>
                </div>
            )}
        </>
    )
}

function PostSkeleton() {
    return (
        <Card
            asChild
            className="overflow-hidden p-0 shadow-sm md:p-0"
        >
            <article>
                <PostSkeletonContent />
                {Array(COMMENTS_INFINITE_SCROLL_COUNT)
                    .fill("")
                    .map((_, idx) => (
                        <CommentSkeleton key={idx} />
                    ))}
            </article>
        </Card>
    )
}
