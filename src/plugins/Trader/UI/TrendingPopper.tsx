import React, { useState, useEffect, useRef, useMemo } from 'react'
import type PopperJs from 'popper.js'
import { Popper, ClickAwayListener, PopperProps } from '@material-ui/core'
import { MessageCenter, ObserveCashTagEvent } from '../messages'
import { useInterval } from 'react-use'

export interface TrendingPopperProps {
    children?: (name: string, reposition?: () => void) => React.ReactNode
    PopperProps?: Partial<PopperProps>
}

export function TrendingPopper(props: TrendingPopperProps) {
    const popperRef = useRef<PopperJs | null>(null)
    const [name, setName] = useState('')
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    useEffect(() => {
        const off = MessageCenter.on('cashTagObserved', (ev: ObserveCashTagEvent) => {
            setName(ev.name)
            setAnchorEl(ev.element)
        })
        return () => {
            off()
            setAnchorEl(null)
        }
    }, [])

    if (!anchorEl) return null
    return (
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
            <Popper
                open={true}
                anchorEl={anchorEl}
                disablePortal
                transition
                style={{ zIndex: 1, marginTop: 8 }}
                popperRef={popperRef}
                {...props.PopperProps}>
                {props.children?.(name, () => setTimeout(() => popperRef.current?.scheduleUpdate(), 0))}
            </Popper>
        </ClickAwayListener>
    )
}
