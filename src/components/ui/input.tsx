import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    invalid?: string | undefined
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, invalid, ...props }, ref) => {
        return (
            <input
                data-invalid={Boolean(invalid)}
                type={type}
                className={cn(
                    `flex h-10 w-full
                    rounded-lg border border-input bg-white px-3 py-2 text-sm ring-ring ring-offset-2 
                    ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium 
                    placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed
                     disabled:opacity-50 data-[invalid=true]:ring-2 data-[invalid=true]:ring-destructive`,
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

type ErrorMessageProps = {
    error: string | undefined
} & React.ComponentProps<"p">

function ErrorMessage({ error, className, ...props }: ErrorMessageProps) {
    return error ? (
        <p
            className={cn("mt-2 text-sm text-destructive", className)}
            {...props}
        >
            {error}
        </p>
    ) : null
}

export { Input, ErrorMessage }
