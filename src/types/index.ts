import {
    Comment,
    CommentVote,
    Community,
    Post,
    PostVote,
    User,
} from "@prisma/client"

export type ExtendedPost = Post & {
    votes: PostVote[]
    comments: Comment[]
    community: Community
    author: User
    content: any
}

export type ExtendedComment = Comment & {
    votes: CommentVote[]
    author: User
    replies: ExtendedComment[]
}
