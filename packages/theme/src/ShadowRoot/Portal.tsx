import { useRef, forwardRef, createContext, useContext } from 'react'
import type { PopperProps } from '@mui/material'
import { StyleSheetsContext } from './Contexts'

let mountingPoint: HTMLDivElement
let mountingShadowRoot: ShadowRoot
export function setupPortalShadowRoot(init: ShadowRootInit) {
    if (mountingShadowRoot) return mountingShadowRoot
    mountingShadowRoot = document.body.appendChild(document.createElement('div')).attachShadow(init)
    mountingPoint = mountingShadowRoot.appendChild(document.createElement('div'))
    return mountingShadowRoot
}

/** usePortalShadowRoot under this context does not do anything. (And it will return an empty container). */
export const NoEffectUsePortalShadowRootContext = createContext(false)

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
export function usePortalShadowRoot(renderer: (container: HTMLElement | undefined) => null | JSX.Element) {
    // we ignore the changes on this property during multiple render
    // so we can violates the React hooks rule and still be safe.
    const disabled = useRef(useContext(NoEffectUsePortalShadowRootContext)).current
    if (disabled) return renderer(undefined)

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const sheets = useContext(StyleSheetsContext)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { container } = useRefInit(() => {
        const portal = PortalShadowRoot()
        const root = portal.appendChild(document.createElement('div'))
        root.dataset.portalShadowRoot = ''
        const shadow = root.attachShadow({ mode: 'open' })
        const container = shadow.appendChild(document.createElement('main'))
        sheets.map((x) => x.addContainer(shadow))
        return { container }
    })

    return renderer(container)
}

export function createShadowRootForwardedComponent<
    T extends { container?: Element | (() => Element | null) | null | undefined; open: boolean },
>(Component: React.ComponentType<T>) {
    return forwardRef((props: T, ref) => {
        return usePortalShadowRoot((container) => <Component container={container} {...props} ref={ref} />)
    }) as any as typeof Component
}

export function createShadowRootForwardedPopperComponent<T extends { PopperProps?: Partial<PopperProps> }>(
    Component: React.ComponentType<T>,
) {
    return forwardRef((props: T, ref) => {
        return usePortalShadowRoot((container) => {
            return <Component {...props} PopperProps={{ container, ...props.PopperProps }} ref={ref} />
        })
    }) as any as typeof Component
}

/**
 * ! Do not export !
 */
function PortalShadowRoot(): Element {
    if (location.protocol.includes('extension')) return document.body
    if (globalThis.location.hostname === 'localhost') return document.body
    if (!mountingPoint) throw new TypeError('Please call setupPortalShadowRoot first')
    return mountingPoint
}

function useRefInit<T>(f: () => T): T {
    const ref = useRef<T>(undefined!)
    if (!ref.current) ref.current = f()
    return ref.current
}
