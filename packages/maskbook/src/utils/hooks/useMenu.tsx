import { SyntheticEvent, cloneElement, isValidElement, useCallback, useRef, useState } from 'react'
import { ShadowRootMenu } from '../shadow-root/ShadowRootComponents'

/**
 * A util hooks for easier to use `<Menu>`s.
 * @param menus Material UI `<MenuItem />` elements
 */
export function useMenu(elements: Array<JSX.Element | null>, anchorSibling = false) {
    const [open, setOpen] = useState(false)
    const anchorElRef = useRef<HTMLElement>()
    const close = () => setOpen(false)
    return [
        <ShadowRootMenu
            PaperProps={{
                style: {
                    borderRadius: 4,
                    boxShadow: 'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px',
                },
            }}
            MenuListProps={{
                style: {
                    paddingTop: 0,
                    paddingBottom: 0,
                },
            }}
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
