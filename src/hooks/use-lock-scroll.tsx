import { useEffect, useState } from "react"
import { useLayoutEffect } from "./use-layout-effect"

type UseLockedBodyOutput = [boolean, (locked: boolean) => void]

export function useLockScroll(initialLocked = false): UseLockedBodyOutput {
    const [locked, setLocked] = useState(initialLocked)

    // Do the side effect before render
    useLayoutEffect(() => {
        if (!locked) {
            return
        }

        const originalOverflow = document.body.style.overflow
        const originalPaddingRight = document.body.style.paddingRight

        document.body.style.overflow = "hidden"

        const root = document.body
        const scrollBarWidth = root ? root.offsetWidth - root.scrollWidth : 0

        if (scrollBarWidth) {
            document.body.style.paddingRight = `${scrollBarWidth}px`
        }

        return () => {
            document.body.style.overflow = originalOverflow

            if (scrollBarWidth) {
                document.body.style.paddingRight = originalPaddingRight
            }
        }
    }, [locked])

    useEffect(() => {
        if (locked !== initialLocked) {
            setLocked(initialLocked)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLocked])

    return [locked, setLocked]
}
