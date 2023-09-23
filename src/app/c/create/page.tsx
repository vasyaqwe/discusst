"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ErrorMessage, Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useFormValidation } from "@/hooks/use-form-validation"
import { toast } from "@/hooks/use-toast"
import {
    CreateCommunityPayload,
    communitySchema,
} from "@/lib/validations/community"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Page() {
    const [formData, setFormData] = useState<CreateCommunityPayload>({
        name: "",
    })
    const router = useRouter()

    const { mutate: onSubmit, isLoading } = useMutation(
        async () => {
            const payload: CreateCommunityPayload = {
                name: formData.name,
            }

            const { data } = await axios.post("/api/community", payload)

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
                    title: "An unknown error occured.",
                    description: "Could not create community.",
                    variant: "destructive",
                })
            },
            onSuccess: (communityName) => {
                router.push(`/c/${communityName}`)
            },
        }
    )

    const { safeOnSubmit, errors } = useFormValidation({
        onSubmit,
        formData,
        zodSchema: communitySchema,
    })

    return (
        <div className="mx-auto max-w-lg">
            <h1 className="text-3xl font-bold">New Community</h1>
            <Card
                asChild
                className="md:mt-10 mt-5 "
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        safeOnSubmit()
                    }}
                >
                    <label
                        htmlFor="name"
                        className="text-xl font-semibold"
                    >
                        Name
                    </label>
                    <div className="relative">
                        <Input
                            invalid={errors.name}
                            name="name"
                            id="name"
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            value={formData.name}
                            type="text"
                            className="mt-2 pl-8"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">
                            c/
                        </span>
                    </div>
                    <ErrorMessage error={errors.name} />
                    <p className="mt-2 text-sm text-muted-foreground">
                        The name of the community can't be changed later on.
                    </p>
                    <div className="mt-5 flex justify-between">
                        <Button disabled={isLoading}>
                            {isLoading && <Spinner />}
                            Create community
                        </Button>
                        <Button
                            role="link"
                            variant={"outline"}
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
