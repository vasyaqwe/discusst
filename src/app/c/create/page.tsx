"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Page({}) {
    return (
        <>
            <h1 className="text-3xl font-bold">New Community</h1>
            <Card className="mt-5">
                <label
                    htmlFor="name"
                    className="text-xl font-semibold"
                >
                    Name
                </label>
                <Input
                    type="text"
                    className="mt-2"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                    The name of the community can't be changed later on.
                </p>
            </Card>
        </>
    )
}
