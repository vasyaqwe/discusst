"use client"

import { Button } from "../ui/button"
import { Icons } from "../ui/icons"
import { useMutation } from "@tanstack/react-query"
import { signIn } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "../ui/spinner"
import Link from "next/link"
import logo from "@public/logo.svg"
import Image from "next/image"
import { cn } from "@/lib/utils"

type AuthFormProps = React.ComponentProps<"div">

export function SignInForm({ className, ...rest }: AuthFormProps) {
    const { toast } = useToast()

    const { isLoading, mutate: login } = useMutation(() => signIn("google"), {
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
            className={cn(
                "flex flex-col items-center justify-center gap-3 text-center",
                className
            )}
            {...rest}
        >
            <Image
                src={logo}
                alt="Discusst"
                className="mx-auto"
            />
            <p className="text-4xl font-semibold">Welcome back</p>
            <p>Sign in into your account to continue discussing.</p>
            <Button
                className="mt-3"
                onClick={() => login()}
            >
                {isLoading ? <Spinner /> : <Icons.google />}
                Sign in with Google
            </Button>
            <p className="mt-4 text-muted-foreground">
                New to Discusst?{" "}
                <Link
                    className="underline hover:no-underline"
                    href={"/sign-up"}
                >
                    Sign up
                </Link>
            </p>
        </div>
    )
}
