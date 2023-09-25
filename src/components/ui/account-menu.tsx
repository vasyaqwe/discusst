"use client"

import { User } from "next-auth"
import { UserAvatar } from "./user-avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./dropdown-menu"
import Link from "next/link"
import { signOut } from "next-auth/react"

type AccountMenuProps = {
    user: User
}

export function AccountMenu({ user }: AccountMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ">
                <UserAvatar user={user} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="px-3 pb-2"
            >
                <p className="text-lg font-medium">{user.name}</p>
                <p className="truncate text-sm text-primary/60">{user.email}</p>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href={"/"}>Feed</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={"/c/create"}>Create community</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={"/settings"}>Settings</Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onSelect={(e) => {
                        e.preventDefault()
                        signOut()
                    }}
                    className="cursor-pointer"
                >
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
