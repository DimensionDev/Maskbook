import {
    unstable_createRoot as createRoot,
    render as legacyRender,
    unmountComponentAtNode as legacyUnmount,
    Root,
} from 'react-dom'
import type {} from 'react/experimental'
import type {} from 'react-dom/experimental'
import { ShadowRootStyleProvider } from './ShadowRootStyleProvider'

export interface RenderInShadowRootConfig {
    /** Allow to render multiple React root into a same ShadowRoot */
    key?: string
    /** The AbortSignal to stop the render */
    signal?: AbortSignal
    /** Use ReactDOM.render instead of ReactDOM.createRoot */
    legacy?: boolean
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
 * A function that render the JSX in the ShadowRoot with JSS (in material-ui/core) and emotion support.
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
    const key = instanceConfig.key || 'main'
    if (shadow.querySelector<HTMLElement>(`main.${key}`)) {
        console.error('Tried to create root in', shadow, 'with key', key, ' which is already used. Skip rendering.')
        return {
            destory: () => {},
            render: () => {},
        }
    }

    const wrap = globalConfig.wrapJSX
    jsx = getJSX(jsx)

    const container = shadow.appendChild(document.createElement('main'))
    container.className = key

    let undoActions: Function[] = []

    // prevent event popup
    {
        const stop = (e: Event): void => e.stopPropagation()
        for (const each of globalConfig.preventEventPropagationList) {
            container.addEventListener(each, stop)
            undoActions.push(() => container.removeEventListener(each, stop))
        }
    }

    let root: Root
    const isLegacy = instanceConfig.legacy
    if (isLegacy) {
        legacyRender(jsx, container)
        undoActions.push(() => legacyUnmount(container))
    } else {
        root = createRoot(container)
        root.render(jsx)
        undoActions.push(() => root.unmount())
    }
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
            jsx = getJSX(jsx)
            if (isLegacy) {
                legacyRender(jsx, container)
            } else {
                root!.render(jsx)
            }
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
