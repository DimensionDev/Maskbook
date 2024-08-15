import { useEffect, useRef, useState, type RefObject } from 'react'
import { emitter } from '../../emitter.js'

const LEAVE_DURATION = 500
export function useControlFarcasterPopup(holderRef: RefObject<HTMLDivElement | null>) {
    const isHoverRef = useRef(false)
    const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

    const [active, setActive] = useState(false)
    if (!holderRef.current && active) setActive(false)

    useEffect(() => {
        const holder = holderRef.current
        if (!holder) return

        const enter = () => {
            isHoverRef.current = true
            clearTimeout(closeTimerRef.current)
        }
        const leave = () => {
            isHoverRef.current = false
            clearTimeout(closeTimerRef.current)
            closeTimerRef.current = setTimeout(() => {
                if (isHoverRef.current) return
                setActive(false)
            }, LEAVE_DURATION)
        }
        holder.addEventListener('mouseenter', enter)
        holder.addEventListener('mouseleave', leave)
        return () => {
            holder.removeEventListener('mouseenter', enter)
            holder.removeEventListener('mouseleave', leave)
        }
    }, [holderRef.current])

    useEffect(() => {
        const unsubscribe = emitter.on('open-farcaster', () => {
            clearTimeout(closeTimerRef.current)
            setActive(true)
        })
        return () => void unsubscribe()
    }, [])

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            // `NODE.contains(other)` doesn't work for cross multiple layer of Shadow DOM
            if (event.composedPath()?.includes(holderRef.current!)) return
            isHoverRef.current = false
            setActive(false)
        }
        document.body.addEventListener('click', onClick, true)
        return () => document.body.removeEventListener('click', onClick, true)
    }, [])

    return active
}
