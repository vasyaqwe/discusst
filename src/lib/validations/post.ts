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

export type CreatePostPayload = z.infer<typeof postSchema>
