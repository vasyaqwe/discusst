"use client"

import { Post, PostSkeleton } from "@/components/post"
import { axiosInstance } from "@/config"
import { toast } from "@/hooks/use-toast"
import { PostVotePayload } from "@/lib/validations/post"
import { ExtendedPost } from "@/types"
import { PostVote, VoteType } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { notFound } from "next/navigation"

type PageProps = {
    params: {
        postId: string
    }
}

export default function Page({ params: { postId } }: PageProps) {
    const { data: session } = useSession()

    const queryKey = ["posts", postId]

    const { data: post, isLoading } = useQuery(queryKey, async () => {
        const { data } = await axiosInstance.get(`/community/posts/${postId}`)

        return data as ExtendedPost
    })

    if (!post && !isLoading) notFound()

    const queryClient = useQueryClient()

    const { mutate: onVote } = useMutation(
        async ({
            voteType,
            postId,
        }: {
            voteType: VoteType
            postId: string
        }) => {
            const payload: PostVotePayload = {
                postId: postId,
                voteType,
            }

            await axiosInstance.patch("/community/posts/vote", payload)
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
                <Post
                    onVote={onVote}
                    post={post}
                />
            )}
        </>
    )
}
