import { SignUpForm } from "@/components/forms/sign-up-form"
import { CloseDialogButton } from "@/components/ui/close-dialog-button"

export default function Page() {
    return (
        <>
            <div className="fixed inset-0 z-10 bg-black/40" />
            <dialog
                open
                className="md:p-10 inset-0 z-20 m-auto rounded-lg border-none bg-white p-6"
            >
                <CloseDialogButton />
                <SignUpForm />
            </dialog>
        </>
    )
}
