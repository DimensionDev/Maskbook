import { SyntheticEvent, cloneElement, isValidElement, useCallback, useRef, useState } from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import type { MenuListProps, PaperProps } from '@material-ui/core'
import { ShadowRootMenu } from '../shadow-root/ShadowRootComponents'

const useStyles = makeStyles((theme) =>
    createStyles({
        paper: {
            borderRadius: 4,
            boxShadow: `${
                theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px'
                    : 'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px'
            }`,
        },
    }),
)

interface MenuProps {
    paperProps?: PaperProps
    menuListProps?: MenuListProps
}

/**
 * A util hooks for easier to use `<Menu>`s.
 * @param menus Material UI `<MenuItem />` elements
 */
export function useMenu(elements: Array<JSX.Element | null>, anchorSibling = false, props?: MenuProps) {
    const [open, setOpen] = useState(false)
    const anchorElRef = useRef<HTMLElement>()
    const close = () => setOpen(false)
    const classes = useStyles()
    return [
        <ShadowRootMenu
            PaperProps={props?.paperProps}
            MenuListProps={props?.menuListProps}
            open={open}
            anchorEl={anchorElRef.current}
            onClose={close}
            onClick={close}>
            {elements.map((element, key) =>
                isValidElement<object>(element) ? cloneElement(element, { ...element.props, key }) : element,
            )}
        </ShadowRootMenu>,
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
