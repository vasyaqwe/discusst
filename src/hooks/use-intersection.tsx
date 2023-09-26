import { RefObject, useEffect, useRef, useState } from "react"

export function useIntersection({
    threshold = 0,
    root = null,
    isLoading = false,
}): {
    ref: RefObject<HTMLElement>
    entry: IntersectionObserverEntry | undefined
} {
    const [entry, setEntry] = useState<IntersectionObserverEntry>()

    const ref = useRef<HTMLElement>(null)

    function updateEntry([entry]: IntersectionObserverEntry[]) {
        setEntry(entry)
    }

    useEffect(() => {
        const node = ref?.current
        const supports = !!window.IntersectionObserver

        if (!supports || !node || isLoading) return

        const observerParams = { threshold, root }
        const observer = new IntersectionObserver(updateEntry, observerParams)
        console.log(ref?.current)
        observer.observe(node)

        return () => observer.disconnect()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref?.current, root, isLoading])

    return { ref, entry }
}
