import { cn } from "@/lib/utils"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/components/layout/header"
import { TanstackProvider } from "@/components/tanstack-provider"
import { Toaster } from "@/components/ui/toaster"
import SessionProvider from "@/components/session-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Discusst",
    description: "Discuss it. Discuss everything. Next.js 13 Reddit clone.",
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
            <body className="min-h-screen bg-background text-foreground">
                <SessionProvider>
                    <TanstackProvider>
                        <Header />
                        <main className="container">
                            {authDialog}
                            {children}
                        </main>
                    </TanstackProvider>
                </SessionProvider>
                <Toaster />
            </body>
        </html>
    )
}
