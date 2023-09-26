import { type ClassValue, clsx } from "clsx"
import { NextResponse } from "next/server"
import { twMerge } from "tailwind-merge"
import * as z from "zod"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
    const formatter = new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
    })
    return formatter.format(date)
}

export function withErrorHandling(
    handler: (req: Request) => Promise<NextResponse>
) {
    return async function (req: Request) {
        try {
            return await handler(req)
        } catch (error) {
            if (error instanceof z.ZodError) {
                return new NextResponse(error.message, { status: 422 })
            }

            return new NextResponse("Unknown server error occurred", {
                status: 500,
            })
        }
    }
}

export const formatRelativeDate = (date: Date) => {
    const now = new Date()
    const diff = +now - +new Date(date)

    if (diff < 1000) {
        return "just now"
    } else if (diff < 60 * 1000) {
        const seconds = Math.floor(diff / 1000)
        return `${seconds} seconds ago`
    } else if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000))
        return `${minutes} minutes ago`
    } else if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000))
        return `${hours} hours ago`
    } else if (diff < 30 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000))
        return `${days} days ago`
    } else if (diff < 365 * 24 * 60 * 60 * 1000) {
        const months = Math.floor(diff / (30 * 24 * 60 * 60 * 1000))
        return `${months} months ago`
    } else {
        const years = Math.floor(diff / (365 * 24 * 60 * 60 * 1000))
        return `${years} years ago`
    }
}
