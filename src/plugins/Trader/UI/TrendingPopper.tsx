import React, { useState, useEffect, useRef } from 'react'
import type PopperJs from 'popper.js'
import { Popper, ClickAwayListener, PopperProps, Fade } from '@material-ui/core'
import { useLocation, useWindowScroll } from 'react-use'
import { MessageCenter } from '../messages'
import type { Platform } from '../types'

export interface TrendingPopperProps {
    children?: (name: string, platforms: Platform[], reposition?: () => void) => React.ReactNode
    PopperProps?: Partial<PopperProps>
}

export function TrendingPopper(props: TrendingPopperProps) {
    const popperRef = useRef<PopperJs | null>(null)
    const [locked, setLocked] = useState(false) // state is updating, lock UI
    const [name, setName] = useState('')
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [availablePlatforms, setAvailablePlatforms] = useState<Platform[]>([])

    // open popper
    useEffect(
        () =>
            MessageCenter.on('cashTagObserved', (ev) => {
                const update = () => {
                    setLocked(true)
                    setName(ev.name)
                    setAnchorEl(ev.element)
                    setAvailablePlatforms(ev.availablePlatforms)
                    setLocked(false)
                }

                // close popper on previous element
                if (anchorEl && anchorEl !== ev.element) {
                    setAnchorEl(null)
                    setTimeout(update, 400)
                    return
                }
                update()
            }),
        [anchorEl],
    )

    // close popper if location was changed
    const location = useLocation()
    useEffect(() => {
        setAnchorEl(null)
    }, [location.state?.key, location.href])

    // close popper if scroll out of visual screen
    const position = useWindowScroll()
    useEffect(() => {
        if (!anchorEl) return
        const rect = anchorEl.getBoundingClientRect()
        if (
            rect.top < 0 || // out off top bound
            rect.top > document.documentElement.clientHeight // out off bottom bound
        )
            setAnchorEl(null)
    }, [anchorEl, Math.floor(position.y / 50)])

    if (locked) return null
    if (!anchorEl) return null
    return (
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
            <Popper
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                disablePortal
                transition
                style={{ zIndex: 1, margin: 4 }}
                popperRef={popperRef}
                {...props.PopperProps}>
                {({ TransitionProps }) => (
                    <Fade in={Boolean(anchorEl)} {...TransitionProps}>
                        <div>
                            {props.children?.(name, availablePlatforms, () =>
                                setTimeout(() => popperRef.current?.scheduleUpdate(), 100),
                            )}
                        </div>
                    </Fade>
                )}
            </Popper>
        </ClickAwayListener>
    )
}
