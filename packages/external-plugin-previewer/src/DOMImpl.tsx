import { setDOMImpl } from 'ef.js'
import type {} from 'react/next'
import type {} from 'react-dom/next'
import { createReactRootShadowedPartial, ReactRootShadowed } from '@masknet/theme'
import * as Components from './Components'
import { RenderContext } from './RenderContext'

const createReactRootShadowed = createReactRootShadowedPartial({
    preventEventPropagationList: [],
})
setDOMImpl({
    Node,
    document: new Proxy(document, {
        get(doc, key) {
            if (key === 'createElement') return createElement
            const val = (doc as any)[key]
            if (typeof val === 'function') return val.bind(doc)
            return val
        },
    }),
})

function createElement(element: string, options: ElementCreationOptions) {
    element = options.is || element
    const _ = shouldRender(element)
    const isValid = _ !== unknown
    const [nativeTag, Component] = _
    const DOM = document.createElement(nativeTag)
    DOM.dataset.kind = element

    const shadow = DOM.attachShadow({ mode: 'open' })

    const props: any = { __proto__: null }
    isValid && render(Component, props, shadow)

    // No attributes allowed
    DOM.setAttribute = () => {}

    // No need to hook event listeners

    // Hook property access
    const proto = Object.getPrototypeOf(DOM)
    Object.setPrototypeOf(
        DOM,
        new Proxy(proto, {
            set(target, prop, value, receiver) {
                // Forward them instead.
                props[prop] = value
                isValid && render(Component, props, shadow)
                return true
            },
        }),
    )
    return DOM
}

function render(f: Components.Component<any>, props: any, shadow: ShadowRoot) {
    const root: ReactRootShadowed =
        (shadow as any).__root || ((shadow as any).__root = createReactRootShadowed(shadow, { tag: 'span' }))
    root.render(
        <RenderContext.Provider value={createRenderContextProxy(shadow)}>
            <HooksContainer f={() => f(props, (event) => void shadow.host.dispatchEvent(event))} />
        </RenderContext.Provider>,
    )
}
// Need use a JSX component to hold hooks
function HooksContainer(props: { f: () => React.ReactNode }) {
    return <>{props.f()}</>
}

function createRenderContextProxy(dom: ShadowRoot): RenderContext {
    return new Proxy({} as any, { get: (_, key) => getContext(dom)[key] })
}
function getContext(node: Node | ShadowRoot | null): any {
    if (!node) return null
    if (node instanceof Element && (node as any).__mask__context__) {
        return (node as any).__mask__context__
    }
    if (node instanceof ShadowRoot) return getContext(node.host)
    if (node.parentNode) return getContext(node.parentNode)
    return null
}

const unknown = ['span', (() => null) as any as Components.Component<any>] as const

function shouldRender(element: string): readonly [string, Components.Component<any>] {
    for (const F of Object.values(Components)) {
        if (F.displayName === element) return ['span', F]
    }
    return unknown
}
