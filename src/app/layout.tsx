import { cn } from "@/lib/utils"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/components/layout/header"
import { Toaster } from "@/components/ui/toaster"
import { TanstackProvider } from "@/components/tanstack-provider"
import SessionProvider from "@/components/session-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Discusst",
    description: "Discuss it. Discuss everything. Next.js 13 Reddit clone.",
}
export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
}

export default function RootLayout({
    children,
    authDialog,
}: {
    children: React.ReactNode
    authDialog: React.ReactNode
}) {
    return (
        <html
            lang="en"
            className={cn("antialiased", inter.className)}
        >
            <body className="min-h-screen bg-background text-foreground [--header-height:68px]">
                <SessionProvider>
                    <TanstackProvider>
                        <Header />
                        <main className="container pb-16 pt-[calc(var(--header-height)+2rem)] md:pt-[calc(var(--header-height)+4rem)]">
                            {authDialog}
                            {children}

                            <Toaster />
                        </main>
                    </TanstackProvider>
                </SessionProvider>
            </body>
        </html>
    )
}
