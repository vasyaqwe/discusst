"use client"

import TextareaAutosize from "react-textarea-autosize"
import { useCallback, useEffect, useRef, useState } from "react"
import type EditorJS from "@editorjs/editorjs"
import { uploadFiles } from "@/lib/uploadthing"
import { Card } from "./card"
import { CreatePostPayload, postSchema } from "@/lib/validations/post"
import { useFormValidation } from "@/hooks/use-form-validation"
import { ErrorMessage } from "./input"
import { Button } from "./button"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { toast } from "@/hooks/use-toast"
import { usePathname, useRouter } from "next/navigation"
import { Spinner } from "./spinner"

type EditorProps = { communityId: string }

export function Editor({ communityId }: EditorProps) {
    const [formData, setFormData] = useState<CreatePostPayload>({
        title: "",
        communityId,
    })

    const [isMounted, setIsMounted] = useState(false)

    const ref = useRef<EditorJS>()

    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsMounted(true)
        }
    }, [])

    const initEditor = useCallback(async () => {
        const EditorJS = (await import("@editorjs/editorjs")).default
        const Header = (await import("@editorjs/header")).default
        // @ts-ignore
        const Embed = (await import("@editorjs/embed")).default
        // @ts-ignore
        const Table = (await import("@editorjs/table")).default
        // @ts-ignore
        const List = (await import("@editorjs/list")).default
        // @ts-ignore
        const Code = (await import("@editorjs/code")).default
        // @ts-ignore
        const LinkTool = (await import("@editorjs/link")).default
        // @ts-ignore
        const InlineCode = (await import("@editorjs/inline-code")).default
        // @ts-ignore
        const ImageTool = (await import("@editorjs/image")).default

        if (!ref.current) {
            const editor = new EditorJS({
                holder: "editor",
                onReady() {
                    ref.current = editor
                },
                placeholder: "Write your post details here...",
                inlineToolbar: true,
                data: { blocks: [] },
                tools: {
                    header: Header,
                    linkTool: {
                        class: LinkTool,
                        config: {
                            endpoint: "/api/link",
                        },
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                async uploadByFile(file: File) {
                                    const [res] = await uploadFiles({
                                        endpoint: "imageUploader",
                                        files: [file],
                                    })

                                    return {
                                        success: 1,
                                        file: {
                                            url: res.url,
                                        },
                                    }
                                },
                            },
                        },
                    },
                    list: List,
                    code: Code,
                    inlineCode: InlineCode,
                    table: Table,
                    embed: Embed,
                },
            })
        }
    }, [])

    useEffect(() => {
        const init = async () => {
            await initEditor()
        }

        if (isMounted) {
            init()

            return () => {
                ref.current?.destroy()
                ref.current = undefined
            }
        }
    }, [isMounted, initEditor])

    const { mutate: onCreatePost, isLoading } = useMutation(
        async (payload: CreatePostPayload) => {
            const { data } = await axios.post(
                "/api/community/post/create",
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
                    description: "Could not create post.",
                    variant: "destructive",
                })
            },
            onSuccess: () => {
                const newPathname = pathname.split("/").slice(0, -1).join("/")

                router.push(newPathname)
                router.refresh()

                toast({
                    title: "Post created.",
                })
            },
        }
    )

    async function onSubmit() {
        const blocks = await ref.current?.save()

        const payload: CreatePostPayload = { ...formData, content: blocks }

        onCreatePost(payload)
    }

    const { safeOnSubmit, errors } = useFormValidation({
        onSubmit,
        formData,
        zodSchema: postSchema,
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                safeOnSubmit()
            }}
        >
            <Card asChild>
                <div>
                    <TextareaAutosize
                        value={formData.title}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                title: e.target.value,
                            }))
                        }
                        autoFocus
                        placeholder="Title"
                        className="w-full resize-none appearance-none bg-transparent text-5xl font-bold placeholder:text-muted-foreground focus:outline-none"
                    />
                    {errors.title && <ErrorMessage error={errors.title} />}
                    <div
                        id="editor"
                        className="min-h-[8rem] px-12 py-5"
                    />
                </div>
            </Card>
            <Button
                disabled={isLoading}
                className="mt-5"
            >
                {isLoading && <Spinner />}
                Create post
            </Button>
        </form>
    )
}
