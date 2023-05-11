import { type CSSProperties, type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { emitter } from '../../emitter.js'
import { attachRectangle } from '@masknet/shared-base'

interface Result {
    active: boolean
    setActive: (x: boolean) => void
    style: CSSProperties
}

const LEAVE_DURATION = 500
const MARGIN = 12
export function useControlLensPopup(holderRef: RefObject<HTMLDivElement>): Result {
    const hoverRef = useRef(false)
    const closeTimerRef = useRef<NodeJS.Timeout>()

    const [active, setActive] = useState(false)
    const [style, setStyle] = useState<CSSProperties>({})

    const hidePopup = useCallback(() => {
        if (hoverRef.current) return
        setActive(false)
    }, [])

    const showProfileCard = useCallback((patchStyle: CSSProperties) => {
        clearTimeout(closeTimerRef.current)
        setActive(true)
        setStyle((old) => {
            const { left, top } = old
            if (left === patchStyle.left && top === patchStyle.top) return old
            return { ...old, ...patchStyle }
        })
    }, [])
    useEffect(() => {
        const holder = holderRef.current
        if (!holder) return
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
    }, [hidePopup])

    useEffect(() => {
        const unsubscribe = emitter.on('open', ({ badgeBounding: bounding }) => {
            const CARD_HEIGHT = holderRef.current!.offsetHeight
            const CARD_WIDTH = holderRef.current!.offsetWidth

            const { x, y } = attachRectangle({
                anchorBounding: bounding,
                targetDimension: { height: CARD_HEIGHT, width: CARD_WIDTH },
                containerDimension: { height: window.innerHeight, width: window.innerWidth },
                margin: MARGIN,
            })

            const pageOffset = document.scrollingElement?.scrollTop || 0
            const newLeft = x
            const newTop = y + pageOffset
            showProfileCard({
                left: newLeft,
                top: newTop,
            })
        })
        return () => void unsubscribe()
    }, [hidePopup, showProfileCard])

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            // `NODE.contains(other)` doesn't work for cross multiple layer of Shadow DOM
            if (event.composedPath()?.includes(holderRef.current!)) return
            hoverRef.current = false
            hidePopup()
        }
        document.body.addEventListener('click', onClick)
        return () => {
            document.body.removeEventListener('click', onClick)
        }
    }, [hidePopup])

    return { style, active, setActive }
}
