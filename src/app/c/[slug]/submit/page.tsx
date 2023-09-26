import { CreatePostForm } from "@/components/forms/create-post-form"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

type PageProps = {
    params: {
        slug: string
    }
}
export default async function Page({ params: { slug } }: PageProps) {
    const community = await db.community.findFirst({ where: { name: slug } })

    if (!community) notFound()

    return <CreatePostForm communityId={community.id} />
}
