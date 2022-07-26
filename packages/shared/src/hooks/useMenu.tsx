import { SyntheticEvent, cloneElement, isValidElement, useCallback, useState, createElement } from 'react'
import { Menu, MenuProps } from '@mui/material'
import { ShadowRootMenu } from '@masknet/theme'
import { useUpdate } from 'react-use'

/**
 * A util hooks for easier to use `<Menu>`s.
 *
 * If you need configuration, please use useMenuConfig
 */
// ! Do not change signature of this. Change useMenuConfig instead.
export function useMenu(...elements: Array<JSX.Element | null>) {
    return useMenuConfig(elements, {})
}

export interface useMenuConfig extends Partial<MenuProps> {
    anchorSibling?: boolean
    useShadowRoot?: boolean
}

export function useMenuConfig(
    elements: Array<JSX.Element | null>,
    config: useMenuConfig,
): [
    menu: React.ReactElement,
    openDialog: (anchorElOrEvent: HTMLElement | SyntheticEvent<HTMLElement>) => void,
    closeDialog: () => void,
] {
    const { anchorSibling = false, useShadowRoot = true, ...menuProps } = config
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
                PaperProps: menuProps?.PaperProps,
                MenuListProps: menuProps?.MenuListProps,
                open,
                anchorEl,
                onClose: close,
                onClick: close,

                anchorOrigin: menuProps?.anchorOrigin,
                transformOrigin: menuProps?.transformOrigin,
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
        useCallback(() => {
            setOpen(false)
        }, []),
    ]
}
