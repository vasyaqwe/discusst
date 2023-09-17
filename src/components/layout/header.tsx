import Link from "next/link"
import logo from "@public/logo.svg"
import Image from "next/image"
import { Button } from "../ui/button"
import { getServerSession } from "next-auth"
import { AccountMenu } from "../ui/account-menu"

export async function Header() {
    const session = await getServerSession()

    return (
        <header className="fixed left-0 top-0 z-10 w-full border-b bg-neutral py-3 ">
            <div className="container flex items-center justify-between">
                <Link
                    href={"/"}
                    className="flex items-center gap-2 text-xl font-semibold"
                >
                    <Image
                        src={logo}
                        alt="Discusst"
                    />
                    Discusst
                </Link>
                {session?.user ? (
                    <AccountMenu user={session.user} />
                ) : (
                    <Button asChild>
                        <Link href={"/sign-in"}>Sign in</Link>
                    </Button>
                )}
            </div>
        </header>
    )
}
