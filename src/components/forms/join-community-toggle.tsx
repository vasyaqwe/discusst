"use client"

import { SubscribeToCommunityPayload } from "@/lib/validations/community"
import { useMutation } from "@tanstack/react-query"
import { Button, ButtonProps } from "../ui/button"
import axios from "axios"
import { Spinner } from "../ui/spinner"
import { toast } from "@/hooks/use-toast"
import { startTransition } from "react"
import { redirect, useRouter } from "next/navigation"
import { Session } from "next-auth"

type JoinCommunityToggleProps = {
    session: Session | null
    communityId: string
    communityName: string
    isSubscribed: boolean
} & ButtonProps

export function JoinCommunityToggle({
    session,
    communityId,
    communityName,
    isSubscribed,
    ...props
}: JoinCommunityToggleProps) {
    const router = useRouter()

    const { mutate: onToggle, isLoading } = useMutation(
        async () => {
            const payload: SubscribeToCommunityPayload = {
                communityId,
            }

            const { data } = await axios.post(
                "/api/community/toggle-subscribe",
                payload
            )

            return data as string
        },
        {
            onError: () => {
                toast({
                    title: "An unknown error occured.",
                    description: `Could not ${
                        isSubscribed ? "leave" : "join"
                    } community.`,
                    variant: "destructive",
                })
            },
            onSuccess: () => {
                startTransition(() => router.refresh())
                if (!isSubscribed) {
                    toast({
                        title: "Subscribed",
                        description: `You are now subscribed to c/${communityName}.`,
                    })
                } else {
                    toast({
                        title: "Unsubscribed",
                        description: `You are not subscribed to c/${communityName} anymore.`,
                    })
                }
            },
        }
    )

    return isSubscribed ? (
        <Button
            variant={"outline"}
            disabled={isLoading}
            onClick={() => {
                if (session) {
                    onToggle()
                } else {
                    router.push("/sign-up")
                }
            }}
            {...props}
        >
            {isLoading ? <Spinner /> : "Leave community"}
        </Button>
    ) : (
        <Button
            disabled={isLoading}
            onClick={() => {
                if (session) {
                    onToggle()
                } else {
                    router.push("/sign-up")
                }
            }}
            {...props}
        >
            {isLoading ? <Spinner /> : "Join community"}
        </Button>
    )
}