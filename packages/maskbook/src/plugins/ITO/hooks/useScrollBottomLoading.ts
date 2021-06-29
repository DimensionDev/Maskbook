import { useLayoutEffect, RefObject } from 'react'
import { debounce } from 'lodash-es'

export function useScrollBottomLoading(ref: RefObject<HTMLDivElement>) {
    useLayoutEffect(() => {
        if (!ref.current) return
        ref.current.addEventListener('scroll', onScroll)
        // useLayoutEffect() to remove the listener before changes painted on screen.
        return () => ref.current!.removeEventListener('scroll', onScroll)
    }, [onScroll])
}

const onScroll = debounce(function (_ev: Event) {
    // it is trick that ev.currentTarget is always null when applies debounce().
    const ev = _ev as Event & { path: HTMLDivElement[] }
    const element = ev.path[0]
    const isArriveBottom = element.scrollTop === element.scrollHeight - element.offsetHeight
}, 200)
