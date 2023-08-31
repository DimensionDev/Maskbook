import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { emitter } from '../../emitter.js'

const LEAVE_DURATION = 500
export function useControlLensPopup(holderRef: RefObject<HTMLDivElement>) {
    const hoverRef = useRef(false)
    const closeTimerRef = useRef<ReturnType<typeof setTimeout>>()

    const [active, setActive] = useState(false)

    const hidePopup = useCallback(() => {
        if (hoverRef.current) return
        setActive(false)
    }, [])

    const showProfileCard = useCallback(() => {
        clearTimeout(closeTimerRef.current)
        setActive(true)
    }, [])
    useEffect(() => {
        const holder = holderRef.current
        if (!holder) {
            hidePopup()
            return
        }
        const enter = () => {
            hoverRef.current = true
            clearTimeout(closeTimerRef.current)
        }
        const leave = () => {
            hoverRef.current = false
            clearTimeout(closeTimerRef.current)
            closeTimerRef.current = setTimeout(hidePopup, LEAVE_DURATION)
        }
        holder.addEventListener('mouseenter', enter)
        holder.addEventListener('mouseleave', leave)
        return () => {
            holder.removeEventListener('mouseenter', enter)
            holder.removeEventListener('mouseleave', leave)
        }
    }, [holderRef.current])

    useEffect(() => {
        const unsubscribe = emitter.on('open', showProfileCard)
        return () => void unsubscribe()
    }, [hidePopup, showProfileCard])

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            // `NODE.contains(other)` doesn't work for cross multiple layer of Shadow DOM
            if (event.composedPath()?.includes(holderRef.current!)) return
            hoverRef.current = false
            hidePopup()
        }
        document.body.addEventListener('click', onClick, true)
        return () => {
            document.body.removeEventListener('click', onClick, true)
        }
    }, [hidePopup])

    return active
}
