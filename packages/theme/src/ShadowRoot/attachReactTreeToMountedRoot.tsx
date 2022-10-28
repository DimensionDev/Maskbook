import { createPortal } from 'react-dom'
import { noop } from 'lodash-unified'
import { ShadowRootStyleProvider } from './ShadowRootStyleProvider.js'
import { PreventShadowRootEventPropagationListContext, stopPropagation } from './Contexts.js'
import { shadowEnvironmentMountingRoots } from './ShadowRootSetup.js'

export interface AttachInShadowRootOptions {
    /** Root tag. @default "main" */
    tag?: keyof HTMLElementTagNameMap
    /** Used to distinguish multiple React root within a same ShadowRoot */
    key?: string
    /** The AbortSignal to stop the render */
    signal?: AbortSignal
}
export interface AttachInShadowRootHostConfig {
    /**
     * A list of event that want to prevent to pop out to the ShadowRoot
     *
     * ! This is not a security boundary !
     */
    preventEventPropagationList: Array<keyof HTMLElementEventMap>
    wrapJSX?(jsx: React.ReactNode): React.ReactNode
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
export function attachReactTreeToMountedRoot_noHost(hostConfig: AttachInShadowRootHostConfig) {
    return function attachReactTreeToMountedRoot(
        shadowRoot: ShadowRoot,
        options: AttachInShadowRootOptions = {},
    ): ReactRootShadowed {
        let jsx: React.ReactNode = ''
        const root: ReactRootShadowed = attach(jsx, shadowRoot, options, hostConfig)
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
    { preventEventPropagationList, wrapJSX }: AttachInShadowRootHostConfig,
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

    jsx = getJSX(jsx)

    const container = shadow.appendChild(document.createElement(tag))
    const instanceKey = `${key}(${Math.random().toString(36).slice(2)})`
    container.className = key

    const controller = new AbortController()
    const signal = controller.signal

    // prevent event popup
    for (const each of preventEventPropagationList) {
        container.addEventListener(each, stopPropagation, { signal })
    }

    shadowEnvironmentMountingRoots.set(instanceKey, createPortal(jsx, container, instanceKey))

    signal.addEventListener(
        'abort',
        () => {
            shadowEnvironmentMountingRoots.delete(instanceKey)
            container.remove()
        },
        { signal },
    )
    options.signal?.addEventListener('abort', () => controller.abort(), { signal })

    return {
        destroy: () => controller.abort(),
        render: (jsx) => {
            shadowEnvironmentMountingRoots.set(instanceKey, createPortal(getJSX(jsx), container, instanceKey))
        },
    }
    function getJSX(jsx: React.ReactNode) {
        return (
            <PreventShadowRootEventPropagationListContext.Provider value={preventEventPropagationList}>
                <ShadowRootStyleProvider shadow={shadow}>{wrapJSX ? wrapJSX(jsx) : jsx}</ShadowRootStyleProvider>
            </PreventShadowRootEventPropagationListContext.Provider>
        )
    }
}
