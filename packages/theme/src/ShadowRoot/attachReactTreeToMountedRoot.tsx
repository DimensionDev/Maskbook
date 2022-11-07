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
export function attachReactTreeToMountedRoot_noHost(wrapJSX?: WrapJSX) {
    return function attachReactTreeToMountedRoot(
        shadowRoot: ShadowRoot,
        options: AttachInShadowRootOptions = {},
    ): ReactRootShadowed {
        let jsx: React.ReactNode = ''
        const root: ReactRootShadowed = attach(jsx, shadowRoot, options, wrapJSX)
        return {
            render: (_jsx) => {
                if (!root) jsx = _jsx
                else root.render(_jsx)
            },
            destroy: () => root.destroy(),
        }
    }
}

function attach(
    jsx: React.ReactNode,
    shadow: ShadowRoot,
    options: AttachInShadowRootOptions,
    wrapJSX: WrapJSX,
): ReactRootShadowed {
    const tag = options.tag || 'main'
    const key = options.key || 'main'
    if (shadow.querySelector<HTMLElement>(`${tag}.${key}`)) {
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

    shadowEnvironmentMountingRoots.set(instanceKey, createPortal(<AttachPointComponent />, container, instanceKey))

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
        render: (newJSX) => {
            jsx = newJSX
            shadowEnvironmentMountingRoots.set(
                instanceKey,
                createPortal(<AttachPointComponent />, container, instanceKey),
            )
        },
    }
    function AttachPointComponent() {
        return ShadowRootStyleProvider({ preventPropagation: true, shadow, children: wrapJSX ? wrapJSX(jsx) : jsx })
    }
}
