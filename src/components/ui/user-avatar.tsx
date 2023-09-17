import { User } from "next-auth"
import { Avatar, AvatarFallback } from "./avatar"
import Image from "next/image"
import { AvatarProps } from "@radix-ui/react-avatar"

type UserAvatarProps = { user: User } & AvatarProps

export async function UserAvatar({ user, ...props }: UserAvatarProps) {
    return (
        <Avatar {...props}>
            {user.image ? (
                <Image
                    width={40}
                    height={40}
                    src={user.image}
                    alt={user.name ?? "user's avatar"}
                    referrerPolicy="no-referrer"
                />
            ) : (
                <AvatarFallback>{user.name}</AvatarFallback>
            )}
        </Avatar>
    )
}
