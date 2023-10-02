"use client"

import { useIntersection } from "@/hooks/use-intersection"
import { ExtendedPost } from "@/types"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { Post, PostSkeleton } from "@/components/post"
import { POSTS_INFINITE_SCROLL_COUNT, axiosInstance } from "@/config"
import { Spinner } from "@/components/ui/spinner"
import {
    InfiniteData,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query"
import { PostVotePayload } from "@/lib/validations/post"
import { toast } from "@/hooks/use-toast"
import { PostVote, VoteType } from "@prisma/client"
import { useSession } from "next-auth/react"

type PostFeedProps = {
    communityName?: string
    initialPosts: ExtendedPost[]
}

export function PostFeed({ communityName, initialPosts }: PostFeedProps) {
    const { data: session } = useSession()

    const queryKey = ["posts"]

    const { isLoading, data, hasNextPage, isFetchingNextPage, fetchNextPage } =
        useInfiniteQuery(
            queryKey,
            async ({ pageParam = 1 }) => {
                const query =
                    `/posts?limit=${POSTS_INFINITE_SCROLL_COUNT}&page=${pageParam}` +
                    (!!communityName ? `&communityName=${communityName}` : "")

                const { data } = await axiosInstance.get(query)

                return data as ExtendedPost[]
            },
            {
                refetchInterval: 70000,
                getNextPageParam: (lastPage, allPages) => {
                    return lastPage.length ? allPages.length + 1 : undefined
                },
                initialData: { pages: [initialPosts], pageParams: [1] },
            }
        )

    const { ref, entry } = useIntersection({
        threshold: 0,
        isLoading,
    })

    useEffect(() => {
        if (entry?.isIntersecting && hasNextPage) fetchNextPage()
    }, [entry, hasNextPage, fetchNextPage])

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
                    queryClient.getQueryData<InfiniteData<ExtendedPost[]>>(
                        queryKey
                    )

                if (prevData) {
                    const updatedVotes = (votes: PostVote[]): PostVote[] => {
                        const existingPostVote = votes.find(
                            (vote) =>
                                vote.postId === postId &&
                                vote.authorId === session?.user.id
                        )

                        if (existingPostVote) {
                            //delete vote if trying to vote again with the same type
                            if (existingPostVote.type === voteType) {
                                return votes.filter((vote) =>
                                    vote.postId === postId &&
                                    vote.authorId === session?.user.id
                                        ? undefined
                                        : vote
                                )
                            }

                            //if vote type is different, update with the new vote type
                            return votes.map((vote) =>
                                vote.postId === postId &&
                                vote.authorId === session?.user.id
                                    ? { ...vote, type: voteType }
                                    : vote
                            )
                        }

                        return [
                            ...votes,
                            {
                                postId: postId,
                                authorId: session?.user.id ?? "",
                                type: voteType,
                            },
                        ]
                    }

                    queryClient.setQueryData<InfiniteData<ExtendedPost[]>>(
                        queryKey,
                        {
                            ...prevData,
                            pages: prevData.pages.map((page) =>
                                page.map((queryPost) =>
                                    queryPost.id === postId
                                        ? {
                                              ...queryPost,
                                              votes: updatedVotes(
                                                  queryPost.votes
                                              ),
                                          }
                                        : queryPost
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

    const posts = data?.pages.flatMap((page) => page) ?? initialPosts

    return (
        <>
            {isLoading ? (
                Array(POSTS_INFINITE_SCROLL_COUNT)
                    .fill("")
                    .map((_, idx) => <PostSkeleton key={idx} />)
            ) : posts.length < 1 ? (
                <p className="text-primary/60">No posts here yet.</p>
            ) : (
                posts.map((post, idx) => {
                    if (idx === posts.length - 1) {
                        return (
                            <Post
                                onVote={onVote}
                                key={post.id}
                                ref={ref}
                                post={post}
                            />
                        )
                    }

                    return (
                        <Post
                            onVote={onVote}
                            key={post.id}
                            post={post}
                        />
                    )
                })
            )}
            {isFetchingNextPage && <Spinner className="mx-auto" />}
        </>
    )
}
