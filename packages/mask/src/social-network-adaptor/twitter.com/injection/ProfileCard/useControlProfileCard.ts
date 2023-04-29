import { CrossIsolationMessages } from '@masknet/shared-base'
import { type CSSProperties, type RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { CARD_HEIGHT, CARD_WIDTH } from './constants.js'
import { useDialogStacking } from '@masknet/theme'

interface Result {
    active: boolean
    style: CSSProperties
}

const LEAVE_DURATION = 500
export function useControlProfileCard(holderRef: RefObject<HTMLDivElement>): Result {
    const hoverRef = useRef(false)
    const closeTimerRef = useRef<NodeJS.Timeout>()
    const skipClick = useRef(false)

    const [active, setActive] = useState(false)
    const [style, setStyle] = useState<CSSProperties>({})
    const hasDialogRef = useRef(false)
    const { stack } = useDialogStacking()
    hasDialogRef.current = stack.length > 0

    const hideProfileCard = useCallback((byClick?: boolean) => {
        if (hoverRef.current || hasDialogRef.current) return
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = setTimeout(() => {
            // Discard the click that would open from external
            if (byClick && skipClick.current) {
                skipClick.current = false
                return
            }
            setActive(false)
        }, LEAVE_DURATION)
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
            hideProfileCard()
        }
        holder.addEventListener('mouseenter', enter)
        holder.addEventListener('mouseleave', leave)
        return () => {
            holder.removeEventListener('mouseenter', enter)
            holder.removeEventListener('mouseleave', leave)
        }
    }, [])

    useEffect(() => {
        return CrossIsolationMessages.events.profileCardEvent.on((event) => {
            if (!event.open) {
                hideProfileCard()
                return
            }
            if (event.external) skipClick.current = true

            const { badgeBounding: bounding } = event
            const reachedBottomBoundary = bounding.bottom + CARD_HEIGHT > window.innerHeight
            let x = Math.max(bounding.left + bounding.width / 2 - CARD_WIDTH / 2, 0)
            let y = bounding.top + bounding.height
            if (reachedBottomBoundary) {
                const reachedTopBoundary = bounding.top < CARD_HEIGHT
                if (reachedTopBoundary) {
                    x = bounding.left + bounding.width
                    y = Math.min(window.innerHeight - CARD_HEIGHT, Math.max(bounding.top - CARD_HEIGHT / 2))
                } else {
                    y = bounding.top - CARD_HEIGHT
                }
            }
            // reached right boundary
            if (x + CARD_WIDTH > window.innerWidth) {
                x = bounding.left - CARD_WIDTH
            }
            // Prefer to show top left corner of the card.
            x = Math.max(0, x)
            y = Math.max(0, y)

            const pageOffset = document.scrollingElement?.scrollTop || 0
            const newLeft = x
            const newTop = y + pageOffset
            showProfileCard({
                left: newLeft,
                top: newTop,
            })
        })
    }, [])

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            // `NODE.contains(other)` doesn't work for cross multiple layer of Shadow DOM
            if (event.composedPath()?.includes(holderRef.current!)) return
            hoverRef.current = false
            hideProfileCard(true)
        }
        document.body.addEventListener('click', onClick)
        return () => {
            document.body.removeEventListener('click', onClick)
        }
    }, [])

    return { style, active }
}
