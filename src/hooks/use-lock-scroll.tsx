import { useEffect, useLayoutEffect, useState } from "react"

export const useLockScroll = ({
    initialLocked = false,
    wrapper = document.body,
}: {
    initialLocked?: boolean
    wrapper?: HTMLElement
}) => {
    const [locked, setLocked] = useState(initialLocked)

    // Do the side effect before render
    useLayoutEffect(() => {
        if (!locked || wrapper === document.documentElement) {
            return
        }

        const originalOverflow = wrapper.style.overflow
        const originalPaddingRight = wrapper.style.paddingRight

        wrapper.style.overflow = "hidden"

        const root = wrapper
        const scrollBarWidth = root ? root.offsetWidth - root.scrollWidth : 0

        if (scrollBarWidth) {
            wrapper.style.paddingRight = `${scrollBarWidth}px`
        }

        return () => {
            wrapper.style.overflow = originalOverflow

            if (scrollBarWidth) {
                wrapper.style.paddingRight = originalPaddingRight
            }
        }
    }, [locked, wrapper])

    useEffect(() => {
        if (locked !== initialLocked) {
            setLocked(initialLocked)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLocked])

    return { locked, setLocked }
}
