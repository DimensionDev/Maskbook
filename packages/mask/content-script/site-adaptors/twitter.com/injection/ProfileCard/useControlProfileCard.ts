import { CrossIsolationMessages } from '@masknet/shared-base'
import { useDialogStacking } from '@masknet/theme'
import type { PopperPlacementType } from '@mui/material'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { CARD_HEIGHT } from './constants.js'

interface Result {
    active: boolean
    placement: PopperPlacementType
}

const LEAVE_DURATION = 500

export function useControlProfileCard(holderRef: RefObject<HTMLDivElement | null>): Result {
    const hoverRef = useRef(false)
    const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
    const skipClick = useRef(false)

    const [active, setActive] = useState(false)
    const [placement, setPlacement] = useState<PopperPlacementType>('bottom')
    const hasDialogRef = useRef(false)
    const { stack } = useDialogStacking()
    // TODO: is this the best we can have?
    // eslint-disable-next-line react-compiler/react-compiler
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

    const showProfileCard = useCallback((placement: PopperPlacementType) => {
        clearTimeout(closeTimerRef.current)
        setActive(true)
        setPlacement(placement)
    }, [])

    // TODO: is this the best we can have?
    // eslint-disable-next-line react-compiler/react-compiler
    if (!holderRef.current) hideProfileCard()

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
    }, [holderRef.current])

    useEffect(() => {
        return CrossIsolationMessages.events.profileCardEvent.on((event) => {
            if (!event.open) {
                hideProfileCard()
                return
            }
            if (event.external) skipClick.current = true
            const reachedBottom = event.anchorBounding.bottom + CARD_HEIGHT > window.innerHeight

            showProfileCard(reachedBottom ? 'auto' : 'bottom')
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
        return () => document.body.removeEventListener('click', onClick)
    }, [])

    return { placement, active }
}
