"use client"

import { Session } from "next-auth"
import { usePathname, useRouter } from "next/navigation"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Input } from "@/components/ui/input"
import { Card, CardProps } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ImageIcon, Link2 } from "lucide-react"
import Link from "next/link"

type CreatePostCtaProps = {
    session: Session | null
} & CardProps

export function CreatePostCta({
    session,
    className,
    ...rest
}: CreatePostCtaProps) {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <Card
            className={cn("flex items-center gap-2 md:gap-3", className)}
            {...rest}
        >
            <UserAvatar user={session?.user} />
            <Input
                onClick={() => router.push(`${pathname}/submit`)}
                placeholder="New post"
            />
            <Button
                asChild
                variant={"ghost"}
                size={"icon"}
            >
                <Link href={`${pathname}/submit`}>
                    <ImageIcon />
                </Link>
            </Button>
            <Button
                asChild
                variant={"ghost"}
                size={"icon"}
            >
                <Link href={`${pathname}/submit`}>
                    <Link2 />
                </Link>
            </Button>
        </Card>
    )
}
