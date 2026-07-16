import { useCallback, useRef, useState } from 'react'

export function usePopoverControl() {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const iconRef = useRef<HTMLElement>(null)
    const mouseLeaveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
    const [open, setOpen] = useState(false)
    const onMouseEnter = useCallback(() => {
        clearTimeout(mouseLeaveTimerRef.current)
        setAnchorEl(iconRef.current)
        return setOpen(true)
    }, [])

    const onMouseLeave = useCallback(() => {
        clearTimeout(mouseLeaveTimerRef.current)
        mouseLeaveTimerRef.current = setTimeout(() => setOpen(false), 1000)
    }, [])

    return {
        open,
        anchorEl,
        setAnchorEl,
        iconRef,
        mouseLeaveTimer: mouseLeaveTimerRef,
        onMouseEnter,
        onMouseLeave,
    }
}
