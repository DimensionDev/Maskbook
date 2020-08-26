import React, { useState, useEffect } from 'react'
import { Popper, ClickAwayListener, PopperProps } from '@material-ui/core'
import { MessageCenter, ObserveCashTagEvent } from '../messages'

export interface TrendingPopperProps {
    children?: (name: string) => React.ReactNode
    PopperProps?: Partial<PopperProps>
}

export function TrendingPopper(props: TrendingPopperProps) {
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
                style={{ zIndex: 1 }}
                {...props.PopperProps}>
                {props.children?.(name)}
            </Popper>
        </ClickAwayListener>
    )
}
