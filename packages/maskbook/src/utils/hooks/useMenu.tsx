import { SyntheticEvent, cloneElement, isValidElement, useCallback, useRef, useState, createElement } from 'react'
import { Menu, PopoverOrigin } from '@material-ui/core'
import type { MenuListProps, PaperProps } from '@material-ui/core'
import { ShadowRootMenu } from '../shadow-root/ShadowRootComponents'

interface MenuProps {
    paperProps?: PaperProps
    menuListProps?: MenuListProps
    anchorOrigin?: PopoverOrigin
    transformOrigin?: PopoverOrigin
}

/**
 * A util hooks for easier to use `<Menu>`s.
 * @param menus Material UI `<MenuItem />` elements
 */
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

                anchorOrigin: props?.anchorOrigin,
                transformOrigin: props?.transformOrigin,
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
