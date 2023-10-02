"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function CloseDialogButton({}) {
    const router = useRouter()

    return (
        <Button
            onClick={() => router.back()}
            className="absolute right-4 top-4"
            variant={"ghost"}
            size={"icon"}
        >
            <X />
        </Button>
    )
}
