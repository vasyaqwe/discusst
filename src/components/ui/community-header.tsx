"use client"

import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

type CommunityHeaderProps = {
    name: string
}

export function CommunityHeader({ name }: CommunityHeaderProps) {
    const pathname = usePathname()
    const router = useRouter()

    const afterSlash = pathname.includes("submit") ? `/ New post` : ""

    return (
        <>
            {afterSlash && (
                <Button
                    role="link"
                    className="mb-3"
                    variant={"link"}
                    onClick={() => router.back()}
                >
                    <ChevronLeft size={18} />
                    Back to community
                </Button>
            )}
            <h1 className="text-4xl font-bold">
                c/{name}
                <span className="text-lg font-semibold opacity-50">
                    {" "}
                    {afterSlash}
                </span>
            </h1>
        </>
    )
}
