import { useRef, useEffect, forwardRef, useState } from 'react'
import { useCurrentShadowRootStyles } from './index'
import type { PopperProps } from '@material-ui/core'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'

/**
 * ! Do not export !
 *
 * You SHOULD NOT use this in React directly
 */
let mountingPoint: HTMLDivElement | null = null
export function setupPortalShadowRoot(
    init: ShadowRootInit,
    preventEventPropagationList: (keyof HTMLElementEventMap)[],
) {
    if (mountingPoint) return
    const shadow = document.body.appendChild(document.createElement('div')).attachShadow(init)
    for (const each of preventEventPropagationList) {
        shadow.addEventListener(each, (e) => e.stopPropagation())
    }
    mountingPoint = shadow.appendChild(document.createElement('div'))
}

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
export function usePortalShadowRoot(renderer: (container: HTMLDivElement) => JSX.Element) {
    const findMountingShadowRef = useRef<HTMLDivElement>(null)
    const update = useUpdate()
    const { root, container, style } = useSideEffectRef(() => {
        const root = document.createElement('div')
        const container = root.appendChild(document.createElement('div'))
        container.appendChild = bind(container.appendChild, container, update)
        container.removeChild = bind(container.removeChild, container, update)
        const style = root.appendChild(document.createElement('style'))
        return { root, container, style }
    })
    const css = useCurrentShadowRootStyles(findMountingShadowRef.current)
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

/**
 * ! Do not export !
 */
function PortalShadowRoot(): Element {
    if (isEnvironment(Environment.ExtensionProtocol)) return document.body
    if (globalThis.location.hostname === 'localhost') return document.body
    if (!mountingPoint) throw new TypeError('Please call setupPortalShadowRoot first')
    return mountingPoint
}

function bind(f: Function, thisArg: unknown, hook: Function) {
    return (...args: any) => {
        try {
            return f.apply(thisArg, args)
        } finally {
            hook()
        }
    }
}

function useUpdate() {
    const [i, _update] = useState(0)
    return () => {
        _update(i + 1)
    }
}

function useSideEffectRef<T>(f: () => T): T {
    const ref = useRef<T>(undefined!)
    if (!ref.current) ref.current = f()
    return ref.current
}
