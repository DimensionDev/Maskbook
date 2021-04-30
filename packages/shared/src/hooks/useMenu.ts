import { SyntheticEvent, cloneElement, isValidElement, useCallback, useRef, useState, createElement } from 'react'
import { Menu } from '@material-ui/core'
import type { MenuListProps, PaperProps } from '@material-ui/core'
import { ShadowRootMenu } from '../ShadowRoot/ShadowRootComponents'

interface MenuProps {
    paperProps?: PaperProps
    menuListProps?: MenuListProps
}

/**
 * A util hooks for easier to use `<Menu>`s.
 * @param menus Material UI `<MenuItem />` elements
 */
//TODO: Split to normal and shadowComponent hook
export function useMenu(
    elements: Array<JSX.Element | null>,
    anchorSibling = false,
    props?: MenuProps,
    useShadowRoot = true,
) {
    const [open, setOpen] = useState(false)
    const anchorElRef = useRef<HTMLElement>()
    const close = () => setOpen(false)
    return [
        createElement(
            useShadowRoot ? ShadowRootMenu : Menu,
            {
                PaperProps: props?.paperProps,
                MenuListProps: props?.menuListProps,
                open: open,
                anchorEl: anchorElRef.current,
                onClose: close,
                onClick: close,
            },
            elements?.map((element, key) =>
                isValidElement<object>(element) ? cloneElement(element, { ...element.props, key }) : element,
            ),
        ),
        useCallback((anchorElOrEvent: HTMLElement | SyntheticEvent<HTMLElement>) => {
            let element: HTMLElement
            if (anchorElOrEvent instanceof HTMLElement) {
                element = anchorElOrEvent
            } else {
                element = anchorElOrEvent.currentTarget
            }

            // when the essential content of currentTarget would be closed over,
            //  we can set the anchorEl with currentTarget's bottom sibling to avoid it.
            anchorElRef.current = anchorSibling ? (element.nextElementSibling as HTMLElement) ?? undefined : element
            setOpen(true)
        }, []),
    ] as const
}
