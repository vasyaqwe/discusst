"use client"

import TextareaAutosize from "react-textarea-autosize"
import { useState } from "react"
import { useFormValidation } from "@/hooks/use-form-validation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ErrorMessage } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CreateCommentPayload, commentSchema } from "@/lib/validations/comment"
import { axiosInstance } from "@/config"

type CreateCommentFormProps = { postId: string }

export function CreateCommentForm({ postId }: CreateCommentFormProps) {
    const [formData, setFormData] = useState<CreateCommentPayload>({
        body: "",
        postId,
    })

    const queryClient = useQueryClient()

    const { mutate: onCreatePost, isLoading } = useMutation(
        async (payload: CreateCommentPayload) => {
            const { data } = await axiosInstance.post(
                `/community/posts/${postId}/comments`,
                payload
            )

            return data
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
                    description: "Could not create comment.",
                    variant: "destructive",
                })
            },
            onSuccess: () => {
                queryClient.invalidateQueries(["posts", postId, "comments"])

                setFormData((prev) => ({ ...prev, body: "" }))

                toast({
                    title: "Comment created.",
                })
            },
        }
    )

    async function onSubmit() {
        const payload: CreateCommentPayload = {
            ...formData,
            body: formData.body,
        }

        onCreatePost(payload)
    }

    const { safeOnSubmit, errors } = useFormValidation({
        onSubmit,
        formData,
        zodSchema: commentSchema,
    })

    return (
        <>
            <h3 className="mb-3 text-xl">Post a comment</h3>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    safeOnSubmit()
                }}
            >
                <Textarea
                    invalid={errors.body}
                    asChild
                >
                    <TextareaAutosize
                        value={formData.body}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                body: e.target.value,
                            }))
                        }
                        autoFocus
                        placeholder="Type your comment here..."
                        className="w-full resize-none "
                    />
                </Textarea>
                {errors.body && <ErrorMessage error={errors.body} />}
                <Button
                    disabled={isLoading}
                    className="mt-3"
                >
                    {isLoading && <Spinner />}
                    Post
                </Button>
            </form>
        </>
    )
}
