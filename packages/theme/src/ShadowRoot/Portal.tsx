/* eslint-disable react-compiler/react-compiler */
/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, useContext } from 'react'
import { Flags } from '@masknet/flags'
import type { PopperProps } from '@mui/material'
import {
    DisableShadowRootContext,
    PreventShadowRootEventPropagationListContext,
    stopPropagation,
    StyleSheetsContext,
} from './Contexts.js'
import { ref } from './ShadowRootSetup.js'

/**
 * Render to a React Portal in to the page needs this hook. It will provide a wrapped container that provides ShadowRoot isolation and CSS support for it.
 *
 * The return value can only be used once!
 * @param renderer A function that want to use PortalShadowRoot
 * @example
 * const picker = usePortalShadowRoot((container) => (
 *      <DatePicker
 *          DialogProps={{ container }}
 *          PopperProps={{ container }}
 *          value={new Date()}
 *          onChange={() => {}}
 *          renderInput={(props) => <TextField {...props} />}
 *      />
 * ))
 */
export function usePortalShadowRoot<T>(renderer: (container: HTMLElement | undefined) => T, debugKey?: string): T {
    const disabled = useRef(useContext(DisableShadowRootContext)).current
    // we ignore the changes on DisableShadowRootContext during multiple render
    // so we can violates the React hooks rule and still be safe.
    if (disabled) return renderer(undefined)

    const sheet = useContext(StyleSheetsContext)
    const signal = useRef<AbortController | null>(null)
    const preventEventPropagationList = useContext(PreventShadowRootEventPropagationListContext)
    const container = useRefInit(() => {
        signal.current = new AbortController()
        const portal = ref.portalContainer

        const root = document.createElement('div')
        root.dataset.portalShadowRoot = debugKey || ''
        const shadow = root.attachShadow(Flags.shadowRootInit)

        for (const each of preventEventPropagationList) {
            shadow.addEventListener(each, stopPropagation, { signal: signal.current.signal })
        }

        const container = shadow.appendChild(document.createElement('main'))

        sheet.addContainer(shadow)

        // This is important to make the portal orders correct.
        Object.defineProperty(container, 'appendChild', {
            configurable: true,
            writable: true,
            value: (child: Node) => {
                if (!root.parentElement) portal.appendChild(root)
                Node.prototype.appendChild.call(container, child)
                return child
            },
        })
        Object.defineProperty(container, 'removeChild', {
            configurable: true,
            writable: true,
            value: (child: Node) => {
                Node.prototype.removeChild.call(container, child)
                if (container.childElementCount === 0) portal.removeChild(root)
                return child
            },
        })

        return container
    })

    return renderer(container)
}

export function createShadowRootForwardedComponent<
    T extends {
        container?: Element | (() => Element | null) | null | undefined
        open: boolean
    },
>(Component: React.ComponentType<T>) {
    return ((props: T) => {
        return usePortalShadowRoot((container) => <Component container={container} {...props} />)
    }) as typeof Component
}

export function createShadowRootForwardedPopperComponent<
    T extends {
        PopperProps?: Partial<PopperProps>
    },
>(Component: React.ComponentType<T>) {
    return ((props: T) => {
        return usePortalShadowRoot((container) => {
            return <Component {...props} PopperProps={{ container, ...props.PopperProps }} />
        })
    }) as typeof Component
}

function useRefInit<T>(f: () => T): T {
    const ref = useRef<T>(undefined!)
    if (!ref.current) ref.current = f()
    return ref.current
}
