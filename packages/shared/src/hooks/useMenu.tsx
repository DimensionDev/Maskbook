import { type SyntheticEvent, useCallback, useState, type JSX, type Ref, Fragment } from 'react'
import { useUpdate } from 'react-use'
import { Menu, type MenuProps } from '@mui/material'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'

/**
 * A util hooks for easier to use `<Menu>`s.
 *
 * If you need configuration, please use useMenuConfig
 */
// ! Do not change signature of this. Change useMenuConfig instead.
export function useMenu(...elements: Array<JSX.Element | null>) {
    return useMenuConfig(elements, {})
}

export interface MenuConfigOptions extends Partial<MenuProps> {
    anchorSibling?: boolean
    useShadowRoot?: boolean
}

const useStyles = makeStyles()((theme) => ({
    menu: {
        // TODO: replace hard code to theme
        boxShadow:
            theme.palette.mode === 'dark' ?
                '0px 0px 20px rgba(255, 255, 255, 0.12)'
            :   '0px 4px 30px rgba(0, 0, 0, 0.1)',
    },
}))

export function useMenuConfig(
    elements: Array<JSX.Element | null>,
    config: MenuConfigOptions,
    ref?: Ref<HTMLDivElement | null>,
): [
    menu: React.ReactNode,
    openDialog: (anchorElOrEvent: HTMLElement | SyntheticEvent<HTMLElement>) => void,
    closeDialog: () => void,
    open: boolean,
] {
    const { classes } = useStyles()
    const { anchorSibling = false, useShadowRoot = true, ...menuProps } = config
    const [open, setOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const close = () => {
        setOpen(false)
        setAnchorEl(null)
    }
    const update = useUpdate()
    const C = useShadowRoot ? ShadowRootMenu : Menu
    return [
        // eslint-disable-next-line react/no-missing-key
        <C
            {...menuProps}
            classes={{ paper: classes.menu, ...menuProps.classes }}
            open={open}
            anchorEl={anchorEl}
            ref={ref}
            onClose={close}
            onClick={close}
            disableScrollLock>
            {elements.map((element, key) => (
                <Fragment key={key}>{element}</Fragment>
            ))}
        </C>,
        useCallback((anchorElOrEvent: HTMLElement | SyntheticEvent<HTMLElement>) => {
            let element: HTMLElement
            if (anchorElOrEvent instanceof HTMLElement) {
                element = anchorElOrEvent
            } else {
                element = anchorElOrEvent.currentTarget
            }

            // when the essential content of currentTarget would be closed over,
            //  we can set the anchorEl with currentTarget's bottom sibling to avoid it.
            const finalAnchor = anchorSibling ? ((element.nextElementSibling as HTMLElement) ?? undefined) : element
            setAnchorEl(finalAnchor)
            setOpen(true)
            // HACK: it seems like anchor doesn't work correctly
            // but a force repaint can solve the problem.
            window.requestAnimationFrame(update)
        }, []),
        useCallback(() => {
            setOpen(false)
            setAnchorEl(null)
        }, []),
        open,
    ]
}
