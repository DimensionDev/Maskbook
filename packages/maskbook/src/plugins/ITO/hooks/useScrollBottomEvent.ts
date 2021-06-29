import { useLayoutEffect, RefObject, useCallback } from 'react'
import { debounce } from 'lodash-es'

export function useScrollBottomEvent(ref: RefObject<HTMLDivElement>, cb: () => void) {
    const onScroll = useCallback(
        debounce(function (_ev: Event) {
            // ev.currentTarget is always null when applies debounce().
            const ev = _ev as Event & { path: HTMLDivElement[] }
            const element = ev.path[0]
            const isBottomArrived = element.scrollTop === element.scrollHeight - element.offsetHeight
            if (isBottomArrived) cb()
        }, 300),
        [cb],
    )

    useLayoutEffect(() => {
        if (!ref.current) return
        ref.current.addEventListener('scroll', onScroll)
        // useLayoutEffect() to remove the listener before changes painted on screen.
        return () => ref.current!.removeEventListener('scroll', onScroll)
    }, [onScroll])
}
