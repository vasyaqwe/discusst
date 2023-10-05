import { SettingsForm } from "@/components/forms/settings-form"
import { getAuthSession } from "@/lib/auth"

export default async function Page() {
    const session = await getAuthSession()

    return (
        <>
            <h1 className="text-3xl font-bold">Settings</h1>
            <SettingsForm session={session} />
        </>
    )
}
