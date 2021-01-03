import { useRef, useEffect, forwardRef } from 'react'
import { useSheetsRegistryStyles } from './renderInShadowRoot'
import { PortalShadowRoot } from './ShadowRootPortal'
import { useInterval } from 'react-use'

/**
 * Render to a portal in our application needs this hook. It will provide a wrapped container that provides ShadowRoot isolation and CSS support for it.
 *
 * The return value can only be used once!
 * @param renderer A function that want to use PortalShadowRoot
 * @example
 * const picker = usePortalShadowRoot((container) => (
 *      <DatePicker
 *          DialogProps={{ container }}
 *          value={new Date()}
 *          onChange={() => {}}
 *          renderInput={(props) => <TextField {...props} />}
 *      />
 * ))
 */
export function usePortalShadowRoot(renderer: (container: HTMLDivElement) => JSX.Element) {
    const findMountingShadowRef = useRef<HTMLDivElement>(null)
    const { current: mountingRef } = useRef(document.createElement('div'))
    const { current: container } = useRef(document.createElement('div'))
    const { current: style } = useRef<HTMLStyleElement>(document.createElement('style'))
    const css = useSheetsRegistryStyles(findMountingShadowRef.current)

    useInterval(() => {
        if (!mountingRef) return
        if (container.children.length === 0) mountingRef.remove()
        else if (mountingRef.parentElement !== PortalShadowRoot()) PortalShadowRoot().appendChild(mountingRef)
    }, 500)

    useEffect(() => {
        if (style.innerHTML !== css) style.innerHTML = css
    }, [style, css])

    useParent(mountingRef, style)
    useParent(mountingRef, container)

    return <div ref={findMountingShadowRef}>{renderer(container)}</div>
}

function useParent(parent: HTMLElement, child: HTMLElement) {
    useEffect(() => {
        if (child.parentElement === parent) return
        parent.appendChild(child)
    })
}

export function createShadowRootForwardedComponent<
    T extends { container?: Element | (() => Element | null) | null | undefined }
>(Component: React.ComponentType<T>) {
    return (forwardRef((props: T, ref) => {
        return usePortalShadowRoot((container) => <Component container={container} {...props} ref={ref} />)
    }) as any) as typeof Component
}
