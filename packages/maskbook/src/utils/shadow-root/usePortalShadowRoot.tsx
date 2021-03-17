import { useRef, useEffect, forwardRef } from 'react'
import { useSheetsRegistryStyles } from './renderInShadowRoot'
import { PortalShadowRoot } from './ShadowRootPortal'
import { useUpdate } from 'react-use'
import type { PopperProps } from '@material-ui/core'

function bind(f: Function, thisArg: unknown, hook: Function) {
    return (...args: any) => {
        try {
            return f.apply(thisArg, args)
        } finally {
            hook()
        }
    }
}
/**
 * Render to a portal in our application needs this hook. It will provide a wrapped container that provides ShadowRoot isolation and CSS support for it.
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
export function usePortalShadowRoot(renderer: (container: HTMLDivElement) => JSX.Element) {
    const findMountingShadowRef = useRef<HTMLDivElement>(null)
    const update = useUpdate()
    const { root, container, style } = useEffectRef(() => {
        const root = document.createElement('div')
        const container = root.appendChild(document.createElement('div'))
        container.appendChild = bind(container.appendChild, container, update)
        container.removeChild = bind(container.removeChild, container, update)
        const style = root.appendChild(document.createElement('style'))
        return { root, container, style }
    })
    const css = useSheetsRegistryStyles(findMountingShadowRef.current)
    const containerInUse = container.children.length !== 0

    useEffect(() => {
        if (!containerInUse) return root.remove()
        const shadow = PortalShadowRoot()
        if (root.parentElement === shadow) return
        shadow.appendChild(root)
    }, [containerInUse, root])

    useEffect(() => {
        if (style.innerHTML !== css) style.innerHTML = css
    }, [style, css])

    return <div ref={findMountingShadowRef}>{renderer(container)}</div>
}

function useEffectRef<T>(f: () => T): T {
    const ref = useRef<T>(undefined!)
    if (!ref.current) ref.current = f()
    return ref.current
}

export function createShadowRootForwardedComponent<
    T extends { container?: Element | (() => Element | null) | null | undefined; open: boolean }
>(Component: React.ComponentType<T>) {
    return (forwardRef((props: T, ref) => {
        return usePortalShadowRoot((container) => <Component container={container} {...props} ref={ref} />)
    }) as any) as typeof Component
}

export function createShadowRootForwardedPopperComponent<T extends { PopperProps?: Partial<PopperProps> }>(
    Component: React.ComponentType<T>,
) {
    return (forwardRef((props: T, ref) => {
        return usePortalShadowRoot((container) => <Component PopperProps={{ container }} {...props} ref={ref} />)
    }) as any) as typeof Component
}
