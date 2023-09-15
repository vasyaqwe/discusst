"use client"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { Icons } from "../ui/icons"
import { useMutation } from "@tanstack/react-query"
import { signIn } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

type AuthFormProps = React.ComponentProps<"div"> & { className?: string }

export function AuthForm({ className, ...rest }: AuthFormProps) {
    const { toast } = useToast()

    const { isLoading, mutate: login } = useMutation(() => signIn(), {
        onSuccess: () => {},
        onError: () => {
            toast({
                title: "An error occured",
                description: "An error occured while signing in with Google",
                variant: "destructive",
            })
        },
    })

    return (
        <div
            className={cn("flex justify-center", className)}
            {...rest}
        >
            <Button
                isLoading={isLoading}
                onClick={() => login()}
            >
                {isLoading ? null : <Icons.google />}
                Sign in with Google
            </Button>
        </div>
    )
}
