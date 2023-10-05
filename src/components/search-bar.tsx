import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Spinner } from "@/components/ui/spinner"
import { axiosInstance } from "@/config"
import { useDebounce } from "@/hooks/use-debounce"
import { useOnClickOutside } from "@/hooks/use-on-click-outside"
import { Community, Prisma } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import { Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type SearchBarProps = {}

export function SearchBar({}: SearchBarProps) {
    const [input, setInput] = useState("")
    const debouncedInput = useDebounce<string>(input, 500)

    const pathname = usePathname()

    const commandRef = useRef<HTMLDivElement>(null)

    const {
        data: results,
        refetch,
        isFetching,
    } = useQuery(
        ["search"],
        async () => {
            if (!input) return []

            const { data } = await axiosInstance.get(`/search?q=${input}`)

            return data as Community[] &
                {
                    _count: Prisma.CommentCountOutputType
                }[]
        },
        {
            enabled: false,
        }
    )

    useOnClickOutside(commandRef, () => {
        setInput("")
    })

    useEffect(() => {
        setInput("")
    }, [pathname])

    useEffect(() => {
        refetch()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedInput])

    return (
        <Command
            ref={commandRef}
            className={`relative z-50 max-w-lg overflow-visible ${
                debouncedInput.length > 0 ? "rounded-b-none" : ""
            } border`}
        >
            <CommandInput
                className="border-none"
                onValueChange={(value) => setInput(value)}
                placeholder="Search communities..."
                value={input}
            />
            {debouncedInput.length > 0 && (
                <CommandList className="absolute inset-x-0 top-full min-h-[68px] rounded-b-lg bg-white outline outline-1 outline-border">
                    {isFetching ? (
                        <Spinner className="absolute inset-0 m-auto" />
                    ) : (results?.length ?? 0) < 1 ? (
                        <div
                            className="min-h-[68px] py-6  text-center text-sm"
                            cmdk-empty=""
                            role="presentation"
                        >
                            No results found.
                        </div>
                    ) : (
                        <CommandGroup heading="Communities">
                            {results?.map((community) => (
                                <CommandItem
                                    key={community.id}
                                    value={community.name}
                                >
                                    <Link
                                        className="flex w-full items-center"
                                        href={`/c/${community.name}`}
                                    >
                                        <Users
                                            className="mr-2"
                                            size={20}
                                        />
                                        {community.name}
                                    </Link>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            )}
        </Command>
    )
}
