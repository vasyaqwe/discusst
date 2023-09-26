import { Comment, Community, Post, PostVote, User } from "@prisma/client"

export type ExtendedPost = Post & {
    votes: PostVote[]
    comments: Comment[]
    community: Community
    author: User
}
