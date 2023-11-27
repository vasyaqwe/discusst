"use client"

import { SignUpForm } from "@/components/forms/sign-up-form"
import { CloseDialogButton } from "@/components/ui/close-dialog-button"
import { useLockScroll } from "@/hooks/use-lock-scroll"

export default function Page() {
    useLockScroll({ initialLocked: true })

    return (
        <>
            <div className="fixed inset-0 z-10 bg-black/40" />
            <dialog
                open
                className="fixed inset-0 z-20 m-auto w-[90%] max-w-[440px] rounded-lg border-none bg-white p-6 md:p-10"
            >
                <CloseDialogButton />
                <SignUpForm />
            </dialog>
        </>
    )
}
