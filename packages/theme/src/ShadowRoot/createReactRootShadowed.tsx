import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import type {} from 'react/next'
import type {} from 'react-dom/next'
import { ShadowRootStyleProvider } from './ShadowRootStyleProvider'
import { PreventEventPropagationListContext } from './Contexts'

export interface RenderInShadowRootOptions {
    /** Root tag. @default "main" */
    tag?: keyof HTMLElementTagNameMap
    /** Used to distinguish multiple React root within a same ShadowRoot */
    key?: string
    /** The AbortSignal to stop the render */
    signal?: AbortSignal
}
export interface CreateRenderInShadowRootHostConfig {
    /**
     * A list of event that want to prevent to pop out to the ShadowRoot
     *
     * ! This is not a security boundary !
     */
    preventEventPropagationList: (keyof HTMLElementEventMap)[]
    wrapJSX?(jsx: React.ReactChild): React.ReactChild
}
export interface ReactRootShadowed {
    render(jsx: React.ReactChild): void
    // do not name it as unmount otherwise it might be compatible with ReactDOM's Root interface.
    destory(): void
}
/**
 * @returns
 * A function that render the JSX in the ShadowRoot with emotion support.
 *
 * This function should be only call once for each config.key.
 */
export function createReactRootShadowedPartial(hostConfig: CreateRenderInShadowRootHostConfig) {
    return function createReactRootShadowed(
        shadowRoot: ShadowRoot,
        options: RenderInShadowRootOptions = {},
    ): ReactRootShadowed {
        let jsx: React.ReactChild = ''
        let root: ReactRootShadowed | null = null
        function tryRender(): void {
            if (options.signal?.aborted) return
            if (shadowRoot.host?.parentNode === null) return void setTimeout(tryRender, 20)

            root = mount(jsx, shadowRoot, options, hostConfig)
        }
        tryRender()
        return {
            render: (_jsx) => {
                if (!root) jsx = _jsx
                else root.render(_jsx)
            },
            destory: () => root?.destory(),
        }
    }
}

function mount(
    jsx: React.ReactChild,
    shadow: ShadowRoot,
    options: RenderInShadowRootOptions,
    { preventEventPropagationList, wrapJSX }: CreateRenderInShadowRootHostConfig,
): ReactRootShadowed {
    const tag = options.tag || 'main'
    const key = options.key || 'main'
    if (shadow.querySelector<HTMLElement>(`${tag}.${key}`)) {
        console.error('Tried to create root in', shadow, 'with key', key, ' which is already used. Skip rendering.')
        return {
            destory: () => {},
            render: () => {},
        }
    }

    jsx = getJSX(jsx)

    const container = shadow.appendChild(document.createElement(tag))
    container.className = key

    const controller = new AbortController()
    const signal = controller.signal

    // prevent event popup
    {
        const stop = (e: Event): void => e.stopPropagation()
        for (const each of preventEventPropagationList) {
            container.addEventListener(each, stop, { signal })
        }
    }

    const root = createRoot(container)
    root.render(jsx)

    signal.addEventListener('abort', () => [root.unmount(), container.remove()], { signal })
    options.signal?.addEventListener('abort', () => controller.abort(), { signal })

    return {
        destory: () => controller.abort(),
        render: (jsx) => {
            root!.render(getJSX(jsx))
        },
    }
    function getJSX(jsx: React.ReactChild) {
        return (
            <StrictMode>
                <PreventEventPropagationListContext.Provider value={preventEventPropagationList}>
                    <ShadowRootStyleProvider shadow={shadow}>{wrapJSX ? wrapJSX(jsx) : jsx}</ShadowRootStyleProvider>
                </PreventEventPropagationListContext.Provider>
            </StrictMode>
        )
    }
}
