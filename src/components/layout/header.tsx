"use client"

import Link from "next/link"
import logo from "@public/logo.svg"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { AccountMenu } from "@/components/ui/account-menu"
import { useSession } from "next-auth/react"
import { SearchBar } from "@/components/search-bar"

export function Header() {
    const { data: session } = useSession()
    return (
        <header className="fixed left-0 top-0 z-10 h-[var(--header-height)] w-full border-b bg-neutral/50 backdrop-blur-md">
            <div className="container flex h-[var(--header-height)] items-center justify-between gap-4">
                <Link
                    href={"/"}
                    className="flex flex-shrink-0 items-center gap-2 text-xl font-semibold"
                >
                    <Image
                        src={logo}
                        alt="Discusst"
                    />
                    <span className="max-sm:hidden">Discusst</span>
                </Link>
                <SearchBar />
                {session?.user ? (
                    <AccountMenu user={session.user} />
                ) : (
                    <Button
                        className="flex-shrink-0"
                        asChild
                    >
                        <Link href={"/sign-in"}>Sign in</Link>
                    </Button>
                )}
            </div>
        </header>
    )
}
