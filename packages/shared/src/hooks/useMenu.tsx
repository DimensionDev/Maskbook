import { SyntheticEvent, cloneElement, isValidElement, useCallback, useState, createContext, useContext } from 'react'
import { Menu, MenuProps } from '@material-ui/core'

/** Provide ShadowRootMenu for useMenu in content script. */
export const useMenuContext = createContext<React.ComponentType<MenuProps>>(Menu)
/**
 * A util hooks for easier to use `<Menu>`s.
 *
 * If you need configuration, please use useMenuConfig
 */
// ! Do not change signature of this. Change useMenuConfig instead.
export function useMenu(
    ...elements: Array<JSX.Element | null>
): [menu: React.ReactElement, openDialog: () => void, closeDialog: () => void] {
    return useMenuConfig(elements, {})
}

export interface useMenuConfig {}
export function useMenuConfig(
    elements: Array<JSX.Element | null>,
    config: useMenuConfig,
): [
    menu: React.ReactElement,
    openDialog: (anchorElOrEvent?: HTMLElement | SyntheticEvent<HTMLElement>) => void,
    closeDialog: () => void,
] {
    const [status, setOpen] = useState(false)
    const open = useCallback(() => setOpen(true), [])
    const close = useCallback(() => setOpen(false), [])
    const Menu = useContext(useMenuContext)
    return [
        <Menu open={status} onClose={close} onClick={close}>
            {elements?.map((element, key) =>
                isValidElement<object>(element) ? cloneElement(element, { ...element.props, key }) : element,
            )}
        </Menu>,
        open,
        close,
    ]
}
