"use client"

import { useIntersection } from "@/hooks/use-intersection"
import { ExtendedPost } from "@/types"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { Post } from "./post"
import { POSTS_INFINITE_SCROLL_COUNT } from "@/config"

type PostFeedProps = {
    communityName?: string
    initialPosts: ExtendedPost[]
}

export function PostFeed({ communityName, initialPosts }: PostFeedProps) {
    const { ref, entry } = useIntersection({
        threshold: 1,
    })

    const { data: session } = useSession()

    const { isLoading, data, hasNextPage, isFetchingNextPage, fetchNextPage } =
        useInfiniteQuery(
            ["posts"],
            async ({ pageParam = 1 }) => {
                const query =
                    `/api/posts/?limit=${POSTS_INFINITE_SCROLL_COUNT}&page=${pageParam}` +
                    !!communityName
                        ? `&communityName=${communityName}`
                        : ""

                const { data } = await axios.get(query)

                return data as ExtendedPost[]
            },
            {
                getNextPageParam: (_, pages) => {
                    return pages.length + 1
                },
            }
        )

    // useEffect(() => {
    //     if (entry?.isIntersecting && hasNextPage) fetchNextPage()
    // }, [entry, hasNextPage, fetchNextPage])

    const posts = data?.pages.flatMap((page) => page) ?? initialPosts

    return (
        <>
            {posts?.map((post, idx) => {
                const votesAmount = post.votes.reduce((acc, currVote) => {
                    if (currVote.type === "UP") return acc + 1
                    if (currVote.type === "DOWN") return acc - 1
                    return acc
                }, 0)

                const alreadyVoted = post.votes.some(
                    (vote) => vote.authorId === session?.user.id
                )

                if (idx === posts.length - 1) {
                    return (
                        <Post
                            key={post.id}
                            ref={ref}
                            post={post}
                        />
                    )
                }

                return (
                    <Post
                        key={post.id}
                        post={post}
                    />
                )
            })}
        </>
    )
}
