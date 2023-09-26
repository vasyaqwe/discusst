import * as z from "zod"

export const postSchema = z.object({
    title: z
        .string()
        .min(3, { message: "Title must contain at least 3 character(s)" })
        .max(130, {
            message: "Title must not contain more than 130 character(s)",
        }),
    communityId: z.string(),
    content: z.any(),
})

export const postsQuerySchema = z.object({
    limit: z.string(),
    page: z.string(),
    communityName: z.string().optional(),
})

export type CreatePostPayload = z.infer<typeof postSchema>
