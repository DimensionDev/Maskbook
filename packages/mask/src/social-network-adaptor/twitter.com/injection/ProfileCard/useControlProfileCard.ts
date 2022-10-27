import { CrossIsolationMessages } from '@masknet/shared-base'
import { CSSProperties, RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { CARD_HEIGHT, CARD_WIDTH } from './constants'

export function useControlProfileCard(holderRef: RefObject<HTMLDivElement>) {
    const activeRef = useRef(false)
    const closeTimerRef = useRef<NodeJS.Timeout>()

    const [style, setStyle] = useState<CSSProperties>({
        visibility: 'hidden',
        borderRadius: 10,
    })

    const hideProfileCard = useCallback(() => {
        if (activeRef.current) return
        setStyle((old) => {
            if (old.visibility === 'hidden') return old
            return {
                ...old,
                visibility: 'hidden',
            }
        })
    }, [])

    const showProfileCard = useCallback((patchStyle: CSSProperties) => {
        clearTimeout(closeTimerRef.current)
        setStyle((old) => {
            const { visibility, left, top } = old
            if (visibility === 'visible' && left === patchStyle.left && top === patchStyle.top) return old
            return { ...old, ...patchStyle, visibility: 'visible' }
        })
    }, [])
    useEffect(() => {
        const holder = holderRef.current
        if (!holder) return
        const enter = () => {
            activeRef.current = true
            clearTimeout(closeTimerRef.current)
        }
        const leave = () => {
            activeRef.current = false
            clearTimeout(closeTimerRef.current)
            closeTimerRef.current = setTimeout(hideProfileCard, 2000)
        }
        holder.addEventListener('mouseenter', enter)
        holder.addEventListener('mouseleave', leave)
        return () => {
            holder.removeEventListener('mouseenter', enter)
            holder.removeEventListener('mouseleave', leave)
        }
    }, [hideProfileCard])

    useEffect(() => {
        return CrossIsolationMessages.events.profileCardEvent.on((event) => {
            if (!event.open) {
                hideProfileCard()
                return
            }
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
    }, [hideProfileCard, showProfileCard])

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            // @ts-ignore
            // `NODE.contains(other)` doesn't work for cross multiple layer of Shadow DOM
            if (event.path?.includes(holderRef.current)) return
            activeRef.current = false
            hideProfileCard()
        }
        document.body.addEventListener('click', onClick)
        return () => {
            document.body.removeEventListener('click', onClick)
        }
    }, [hideProfileCard])

    return style
}
