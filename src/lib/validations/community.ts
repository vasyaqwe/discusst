import * as z from "zod"

export const communitySchema = z.object({
    name: z.string().min(3).max(18),
})

export const communitySubscriptionSchema = z.object({
    communityId: z.string(),
})

export type CreateCommunityPayload = z.infer<typeof communitySchema>

export type SubscribeToCommunityPayload = z.infer<
    typeof communitySubscriptionSchema
>
