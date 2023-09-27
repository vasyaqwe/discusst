"use client"

import { useIntersection } from "@/hooks/use-intersection"
import { ExtendedPost } from "@/types"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { Post, PostSkeleton } from "./post"
import { POSTS_INFINITE_SCROLL_COUNT } from "@/config"
import { Spinner } from "./ui/spinner"

type PostFeedProps = {
    communityName?: string
    initialPosts: ExtendedPost[]
}

export function PostFeed({ communityName, initialPosts }: PostFeedProps) {
    const { data: session } = useSession()

    const { isLoading, data, hasNextPage, isFetchingNextPage, fetchNextPage } =
        useInfiniteQuery(
            ["posts"],
            async ({ pageParam = 1 }) => {
                const query =
                    `/api/posts?limit=${POSTS_INFINITE_SCROLL_COUNT}&page=${pageParam}` +
                    (!!communityName ? `&communityName=${communityName}` : "")

                const { data } = await axios.get(query)

                return data as ExtendedPost[]
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

    const posts = data?.pages.flatMap((page) => page) ?? initialPosts

    return (
        <>
            {isLoading
                ? Array(POSTS_INFINITE_SCROLL_COUNT)
                      .fill("")
                      .map((_, idx) => <PostSkeleton key={idx} />)
                : posts?.map((post, idx) => {
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
            {isFetchingNextPage && <Spinner className="mx-auto" />}
        </>
    )
}
