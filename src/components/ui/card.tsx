import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

type CardProps = {
    asChild?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export function Card({ asChild = false, className, ...props }: CardProps) {
    const Comp = asChild ? Slot : "div"

    return (
        <Comp
            className={cn("rounded-xl border bg-card p-5", className)}
            {...props}
        />
    )
}
