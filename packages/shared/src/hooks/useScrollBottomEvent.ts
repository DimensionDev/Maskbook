import { useLayoutEffect, RefObject, useCallback } from 'react'
import { debounce } from 'lodash-es'

export function useScrollBottomEvent(ref: RefObject<HTMLDivElement | HTMLUListElement>, cb: () => void) {
    const onScroll = useCallback(
        debounce(function (_ev: Event) {
            // ev.currentTarget is always null when applies debounce().
            const ev = _ev as Event & { path: HTMLDivElement[] }
            const element = ev.path[0]
            // On some device, there's a slight deviation between `scrollHeight` and `offsetHeight + scrollTop`
            const isBottomArrived = Math.abs(element.scrollHeight - element.offsetHeight - element.scrollTop) < 5
            if (isBottomArrived) cb()
        }, 300),
        [cb],
    )

    useLayoutEffect(() => {
        if (!ref.current) return
        ref.current.addEventListener('scroll', onScroll)
        // useLayoutEffect() to remove the listener before changes painted on screen.
        return () => {
            if (!ref.current) return
            ref.current.removeEventListener('scroll', onScroll)
        }
    }, [onScroll, ref.current])
}
