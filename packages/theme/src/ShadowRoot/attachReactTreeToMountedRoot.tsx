import { createPortal } from 'react-dom'
import { noop } from 'lodash-es'
import { ShadowRootStyleProvider } from './ShadowRootStyleProvider.js'
import { shadowEnvironmentMountingRoots, WrapJSX } from './ShadowRootSetup.js'

export interface AttachInShadowRootOptions {
    /** Root tag. @default "main" */
    tag?: keyof HTMLElementTagNameMap
    /** Used to distinguish multiple React root within a same ShadowRoot */
    key?: string
    /** The AbortSignal to stop the render */
    signal?: AbortSignal
    /** Defer the tree until the mount point is near visible in the document */
    untilVisible?: boolean
}

export interface ReactRootShadowed {
    render(jsx: React.ReactNode): void
    // do not name it as unmount otherwise it might be compatible with ReactDOM's Root interface.
    destroy(): void
}
/**
 * @returns
 * A function that render the JSX in the ShadowRoot with emotion support.
 *
 * This function should be only call once for each config.key.
 */
export function attachReactTreeToMountedRoot_noHost(
    wrapJSX?: WrapJSX,
): (shadow: ShadowRoot, options?: AttachInShadowRootOptions | undefined) => ReactRootShadowed {
    return attachReactTreeToMountedRoot.bind(null, wrapJSX)
}

function attachReactTreeToMountedRoot(
    wrapJSX: WrapJSX,
    shadow: ShadowRoot,
    options: AttachInShadowRootOptions = {},
): ReactRootShadowed {
    const tag = options.tag || 'main'
    const key = options.key || 'main'

    if (shadow.querySelector(`${tag}.${key}`)) {
        console.error('Tried to create root in', shadow, 'with key', key, ' which is already used. Skip rendering.')
        return {
            destroy: noop,
            render: noop,
        }
    }

    const container = shadow.appendChild(document.createElement(tag))
    const instanceKey = `${key}(${Math.random().toString(36).slice(2)})`
    container.className = key

    const controller = new AbortController()
    const signal = controller.signal

    function render(jsx: React.ReactNode) {
        if (signal.aborted) return
        shadowEnvironmentMountingRoots.set(
            instanceKey,
            createPortal(<AttachPointComponent children={jsx} />, container, instanceKey),
        )
    }

    signal.addEventListener(
        'abort',
        () => {
            shadowEnvironmentMountingRoots.delete(instanceKey)
            container.remove()
        },
        { signal },
    )
    options.signal?.addEventListener('abort', () => controller.abort(), { signal })
    AttachPointComponent.displayName = `ShadowRootAttachPoint (${key})`

    return {
        destroy: () => controller.abort(),
        render: (jsx) => {
            if (options.untilVisible && !isElementPartiallyInViewport(container)) {
                observe(container, key, () => render(jsx), signal)
                return
            }
            render(jsx)
        },
    }
    function AttachPointComponent({ children: jsx }: React.PropsWithChildren<{}>) {
        return ShadowRootStyleProvider({ preventPropagation: true, shadow, children: wrapJSX ? wrapJSX(jsx) : jsx })
    }
}
let observer: IntersectionObserver
const callbacks = new Map<Element, Record<string, () => void>>()
function observe(element: Element, key: string, callback: () => void, signal: AbortSignal) {
    if (signal.aborted) return
    if (!observer)
        observer = new IntersectionObserver(
            (records) => {
                records
                    .filter((x) => x.isIntersecting)
                    .map((x) => {
                        const result = callbacks.get(x.target)
                        callbacks.delete(x.target)
                        return result!
                    })
                    .filter(Boolean)
                    .flatMap(Object.values)
                    .forEach((f) => f())
            },
            // preload the element before it really hits the viewport
            { root: null, threshold: 0.1, rootMargin: '20px 0px 50px 0px' },
        )

    observer.observe(element)
    signal.addEventListener('abort', () => observer.unobserve(element), { signal })
    callbacks.set(element, { ...callbacks.get(element), [key]: callback })
}
function isElementPartiallyInViewport(element: Element) {
    const { top, left, height, width } = element.getBoundingClientRect()

    const vertInView = top <= document.documentElement.clientHeight && top + height >= 0
    const horInView = left <= document.documentElement.clientWidth && left + width >= 0

    return vertInView && horInView
}
