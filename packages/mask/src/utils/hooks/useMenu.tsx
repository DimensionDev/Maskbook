import { SyntheticEvent, cloneElement, isValidElement, useCallback, useState, createElement } from 'react'
import { Menu, PopoverOrigin } from '@mui/material'
import type { MenuListProps, PaperProps } from '@mui/material'
import { ShadowRootMenu } from '../shadow-root/ShadowRootComponents'
import { useUpdate } from 'react-use'

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
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const close = () => {
        setOpen(false)
        setAnchorEl(null)
    }
    const update = useUpdate()
    return [
        createElement(
            useShadowRoot ? ShadowRootMenu : Menu,
            {
                PaperProps: props?.paperProps,
                MenuListProps: props?.menuListProps,
                open,
                anchorEl,
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
            const finalAnchor = anchorSibling ? (element.nextElementSibling as HTMLElement) ?? undefined : element
            setAnchorEl(finalAnchor)
            setOpen(true)
            // HACK: it seems like anchor doesn't work correctly
            // but a force repaint can solve the problem.
            window.requestAnimationFrame(update)
        }, []),
    ] as const
}
