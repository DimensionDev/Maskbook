import React, { useCallback, useRef, useState } from 'react'
import { Menu } from '@material-ui/core'
import { GetContext } from '@dimensiondev/holoflows-kit/es'
import { PortalShadowRoot } from '../shadow-root/ShadowRootPortal'

/**
 * A util hooks for easier to use `<Menu>`s.
 * @param menus Material UI `<MenuItem />` elements
 */
export function useMenu(...menus: (JSX.Element | undefined)[]) {
    const [open, setOpen] = useState(false)
    const anchorElRef = useRef<HTMLElement>()
    const close = () => setOpen(false)
    return [
        <Menu
            container={GetContext() === 'content' ? PortalShadowRoot : undefined}
            open={open}
            anchorEl={anchorElRef.current}
            onClose={close}
            onClick={close}
            children={menus}
        />,
        useCallback((anchorElOrEvent: HTMLElement | { currentTarget: HTMLElement }) => {
            if (anchorElOrEvent instanceof HTMLElement) anchorElRef.current = anchorElOrEvent
            else anchorElRef.current = anchorElOrEvent.currentTarget
            setOpen(true)
        }, []),
    ] as const
}
