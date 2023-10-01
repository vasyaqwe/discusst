import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export type TextareaProps =
    React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
        asChild?: boolean
        invalid?: string | undefined
    }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, asChild = false, invalid, ...props }, ref) => {
        const Comp = asChild ? Slot : "textarea"

        return (
            <Comp
                data-invalid={Boolean(invalid)}
                className={cn(
                    `flex min-h-[80px] w-full rounded-lg border border-input bg-white px-3 py-2 text-sm ring-ring 
                    ring-offset-2 ring-offset-white placeholder:text-muted-foreground focus-visible:outline-none
                     focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 data-[invalid=true]:ring-2
                     data-[invalid=true]:ring-destructive md:text-base
                     `,
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
