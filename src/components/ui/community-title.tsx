"use client"

import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "./button"

type CommunityTitleProps = {
    name: string
}

export function CommunityTitle({ name }: CommunityTitleProps) {
    const pathname = usePathname()
    const router = useRouter()

    const afterSlash = pathname.includes("submit") ? `/ New post` : ""

    return (
        <>
            <Button
                role="link"
                className="mb-3"
                variant={"link"}
                onClick={() => router.back()}
            >
                <ChevronLeft />
                Back
            </Button>
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
