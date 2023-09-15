import { AuthForm } from "@/components/forms/auth-form"

type PageProps = {}

export default function Page({}: PageProps) {
    return (
        <div className="grid min-h-screen place-content-center gap-4 text-center">
            <h1 className="text-4xl">Welcome back</h1>
            <p>Sign in into your account to continue discussing.</p>
            <AuthForm />
        </div>
    )
}
