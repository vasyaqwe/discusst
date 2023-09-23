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

export function SignUpForm({ className, ...rest }: AuthFormProps) {
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
            <p className="text-4xl font-semibold">Sign up</p>
            <p>Create an account now to start discussing.</p>
            <Button
                className="mt-3"
                onClick={() => login()}
            >
                {isLoading ? <Spinner /> : <Icons.google />}
                Sign up with Google
            </Button>
            <p className="mt-4 text-muted-foreground">
                Already have an account?{" "}
                <Link
                    className="underline hover:no-underline"
                    href={"/sign-in"}
                >
                    Sign in
                </Link>
            </p>
        </div>
    )
}
