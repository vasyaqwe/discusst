import { getServerSession, type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "@/lib/db"
import { nanoid } from "nanoid"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/sign-in",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({ token, session }) {
            if (token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture
                session.user.username = token.username
            }

            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }

            const dbUser = await db.user.findFirst({
                where: {
                    id: token.id,
                },
            })

            if (!dbUser) {
                if (user) {
                    token.id = user.id
                }
                return token
            }

            if (!dbUser.username) {
                await db.user.update({
                    where: {
                        id: dbUser.id,
                    },
                    data: {
                        username: nanoid(7),
                    },
                })
            }

            return {
                id: token.id,
                name: token.name,
                email: token.email,
                picture: token.picture,
                username: dbUser.username,
            }
        },
        redirect({ baseUrl }) {
            return baseUrl
        },
    },
}

export const getAuthSession = () => getServerSession(authOptions)
