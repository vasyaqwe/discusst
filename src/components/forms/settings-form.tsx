"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ErrorMessage, Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { axiosInstance } from "@/config"
import { useFormValidation } from "@/hooks/use-form-validation"
import { toast } from "@/hooks/use-toast"
import {
    UpdateSettingsPayload,
    settingsSchema,
} from "@/lib/validations/settings"
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { Session } from "next-auth"
import { useRouter } from "next/navigation"
import { useState } from "react"

type SettingsFormProps = {
    session: Session | null
}

export function SettingsForm({ session }: SettingsFormProps) {
    const router = useRouter()

    const [formData, setFormData] = useState<UpdateSettingsPayload>({
        username: session?.user.username ?? "",
    })

    const { mutate: onSubmit, isLoading } = useMutation(
        async () => {
            const payload: UpdateSettingsPayload = {
                username: formData.username,
            }

            const { data } = await axiosInstance.patch("/settings", payload)

            return data as string
        },
        {
            onError: (error) => {
                if (error instanceof AxiosError) {
                    return toast({
                        title: error.response?.data.title,
                        description: error.response?.data.description,
                        variant: "destructive",
                    })
                }

                toast({
                    title: "Something went wrong.",
                    description: "Could not update settings.",
                    variant: "destructive",
                })
            },
            onSuccess: () => {
                router.refresh()
                toast({
                    title: "Settings updated.",
                })
            },
        }
    )

    const { safeOnSubmit, errors } = useFormValidation({
        onSubmit,
        formData,
        zodSchema: settingsSchema,
    })
    return (
        <Card
            asChild
            className="mt-6"
        >
            <form
                autoComplete="new-password"
                onSubmit={(e) => {
                    e.preventDefault()
                    safeOnSubmit()
                }}
            >
                <label
                    htmlFor="username"
                    className="text-xl font-semibold"
                >
                    Username
                </label>
                <div className="relative">
                    <Input
                        autoComplete="new-password"
                        invalid={errors.username}
                        name="username"
                        id="username"
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                username: e.target.value,
                            }))
                        }
                        value={formData.username}
                        type="text"
                        className="mt-2 pl-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">
                        u/
                    </span>
                </div>
                <ErrorMessage error={errors.username} />
                <p className="mt-2 text-sm text-muted-foreground">
                    Choose a unique username.
                </p>
                <div className="mt-5 flex justify-between">
                    <Button disabled={isLoading}>
                        {isLoading && <Spinner />}
                        Update
                    </Button>
                    <Button
                        type="button"
                        role="link"
                        variant={"outline"}
                        onClick={() => router.back()}
                    >
                        Go back
                    </Button>
                </div>
            </form>
        </Card>
    )
}
