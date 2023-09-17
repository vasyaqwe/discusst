"use client"
import Link from "next/link"
import logo from "@public/logo.svg"
import Image from "next/image"
import { Button, buttonVariants } from "../ui/button"
import { signOut, useSession } from "next-auth/react"

export function Header() {
    const { data: session } = useSession()

    return (
        <header className="fixed left-0 top-0 z-10 w-full border-b bg-neutral py-3">
            <div className="container flex items-center justify-between">
                <Link
                    href={"/"}
                    className="flex items-center gap-2 text-xl font-semibold"
                >
                    <Image
                        src={logo}
                        alt="Discusst"
                    />
                    Discusst
                </Link>
                {session ? (
                    <Button
                        onClick={() => signOut()}
                        className={buttonVariants()}
                    >
                        Sign out
                    </Button>
                ) : (
                    <Link
                        href={"/sign-in"}
                        className={buttonVariants()}
                    >
                        Sign in
                    </Link>
                )}
            </div>
        </header>
    )
}
