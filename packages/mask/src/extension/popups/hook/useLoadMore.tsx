import { useState, useEffect, type RefObject } from 'react'
import { throttle } from 'lodash-es'
export function useLoadMore(ref: RefObject<HTMLElement>) {
    const [isAtBottom, setIsAtBottom] = useState(false)
    const container = ref.current
    function handleScroll() {
        if (!container) return
        setIsAtBottom(container.scrollTop + container.clientHeight >= container.scrollHeight - 300)
    }

    useEffect(() => {
        if (!container) return
        const throttledScrollHandler = throttle(handleScroll, 300)
        container.addEventListener('scroll', throttledScrollHandler)
        return () => {
            if (container) container.removeEventListener('scroll', throttledScrollHandler)
        }
    }, [container])

    return isAtBottom
}
