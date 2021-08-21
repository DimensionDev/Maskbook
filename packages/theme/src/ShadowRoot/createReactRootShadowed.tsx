import { createRoot } from 'react-dom'
import type {} from 'react/next'
import type {} from 'react-dom/next'
import { ShadowRootStyleProvider } from './ShadowRootStyleProvider'

export interface RenderInShadowRootConfig {
    /** Root tag. @default "main" */
    tag?: keyof HTMLElementTagNameMap
    /** Allow to render multiple React root into a same ShadowRoot */
    key?: string
    /** The AbortSignal to stop the render */
    signal?: AbortSignal
}
export interface CreateRenderInShadowRootConfig {
    onHeadCreate?(head: HTMLHeadElement): void
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
export function createReactRootShadowedPartial(_config: CreateRenderInShadowRootConfig) {
    return function createReactRootShadowed(
        shadowRoot: ShadowRoot,
        config: RenderInShadowRootConfig = {},
    ): ReactRootShadowed {
        let jsx: React.ReactChild = ''
        let root: ReactRootShadowed | null = null
        function tryRender(): void {
            if (config.signal?.aborted) return
            if (shadowRoot.host?.parentNode === null) return void setTimeout(tryRender, 20)

            root = mount(jsx, shadowRoot, config, _config)
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
    instanceConfig: RenderInShadowRootConfig,
    globalConfig: CreateRenderInShadowRootConfig,
): ReactRootShadowed {
    const tag = instanceConfig.tag || 'main'
    const key = instanceConfig.key || 'main'
    if (shadow.querySelector<HTMLElement>(`${tag}.${key}`)) {
        console.error('Tried to create root in', shadow, 'with key', key, ' which is already used. Skip rendering.')
        return {
            destory: () => {},
            render: () => {},
        }
    }

    const wrap = globalConfig.wrapJSX
    jsx = getJSX(jsx)

    const container = shadow.appendChild(document.createElement(tag))
    container.className = key

    const undoActions: Function[] = []

    // prevent event popup
    {
        const stop = (e: Event): void => e.stopPropagation()
        for (const each of globalConfig.preventEventPropagationList) {
            container.addEventListener(each, stop)
            undoActions.push(() => container.removeEventListener(each, stop))
        }
    }

    const root = createRoot(container)
    root.render(jsx)
    undoActions.push(() => root.unmount())
    undoActions.push(() => container.remove())

    function undo() {
        for (const f of undoActions) {
            try {
                f()
            } catch {}
        }
        undoActions.length = 0
    }
    instanceConfig.signal?.addEventListener('abort', undo)
    return {
        destory: undo,
        render: (jsx) => {
            root!.render(getJSX(jsx))
        },
    }
    function getJSX(jsx: React.ReactChild) {
        return (
            <ShadowRootStyleProvider shadow={shadow} onHeadCreate={globalConfig.onHeadCreate}>
                {wrap ? wrap(jsx) : jsx}
            </ShadowRootStyleProvider>
        )
    }
}
