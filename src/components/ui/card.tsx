import { cn } from "@/lib/utils"
import { ReactNode } from "react"

type CardProps = {
    children: ReactNode
} & React.ComponentProps<"div">

export function Card({ children, className, ...props }: CardProps) {
    return (
        <div
            className={cn("rounded-xl border p-5", className)}
            {...props}
        >
            {children}
        </div>
    )
}
