"use client"

import { Session } from "next-auth"
import { usePathname, useRouter } from "next/navigation"
import { UserAvatar } from "../ui/user-avatar"
import { Input } from "../ui/input"

type CreatePostFormProps = {
    session: Session | null
}

export function CreatePostForm({ session }: CreatePostFormProps) {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <div>
            <UserAvatar user={session?.user} />
            <Input
                readOnly
                placeholder="Create post"
            />
        </div>
    )
}
