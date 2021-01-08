import { useCallback, useRef, useState } from 'react'
import { ShadowRootMenu } from '../shadow-root/ShadowRootComponents'

/**
 * A util hooks for easier to use `<Menu>`s.
 * @param menus Material UI `<MenuItem />` elements
 */
export function useMenu(...menus: (JSX.Element | undefined)[]) {
    const [open, setOpen] = useState(false)
    const anchorElRef = useRef<HTMLElement>()
    const close = () => setOpen(false)
    return [
        <ShadowRootMenu open={open} anchorEl={anchorElRef.current} onClose={close} onClick={close}>
            {menus}
        </ShadowRootMenu>,
        useCallback((anchorElOrEvent: HTMLElement | { currentTarget: HTMLElement }) => {
            if (anchorElOrEvent instanceof HTMLElement) anchorElRef.current = anchorElOrEvent
            else anchorElRef.current = anchorElOrEvent.currentTarget
            setOpen(true)
        }, []),
    ] as const
}
