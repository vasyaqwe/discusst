import { CreatePostForm } from "@/components/forms/create-post-form"
import { db } from "@/lib/db"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

type PageProps = {
    params: {
        slug: string
    }
}
export default async function Page({ params: { slug } }: PageProps) {
    const community = await db.community.findFirst({ where: { name: slug } })

    if (!community) notFound()

    return (
        <div className="relative">
            <Link
                href={`/c/${community.name}`}
                className="flex items-center gap-2 font-medium underline-offset-4 hover:underline max-md:mb-3 md:absolute md:-top-8"
            >
                <ChevronLeft size={18} />
                Back to community
            </Link>
            <CreatePostForm communityId={community.id} />
        </div>
    )
}
