import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HomeIcon } from "lucide-react"
import Link from "next/link"

export default function Home() {
    return (
        <>
            <h1 className="text-3xl font-bold">Your feed</h1>
            <Card className="mt-5 overflow-hidden p-0 md:mt-10 md:p-0">
                <div className="bg-accent p-5 lg:p-6">
                    <h2 className="text-accent-foreground">
                        <HomeIcon className="inline " />{" "}
                        <span className="align-middle">Home</span>
                    </h2>
                </div>
                <div className="p-5 lg:p-6">
                    <p>
                        Welcome to the homepage. Check in with your favorite
                        communities here.
                    </p>
                    <Button
                        asChild
                        className="mt-7 w-full xs:w-fit"
                    >
                        <Link href={"/c/create"}>New Community</Link>
                    </Button>
                </div>
            </Card>
        </>
    )
}
