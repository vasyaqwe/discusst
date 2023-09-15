import { cn } from "@/lib/utils"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/components/layout/header"
import { TanstackProvider } from "@/components/tanstack-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Discusst",
    description: "Discuss it. Discuss everything. Next.js 13 Reddit clone.",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html
            lang="en"
            className={cn("antialiased", inter.className)}
        >
            <body className="min-h-screen bg-background text-foreground">
                <TanstackProvider>
                    <Header />
                    <main className="container">{children}</main>
                </TanstackProvider>
                <Toaster />
            </body>
        </html>
    )
}
