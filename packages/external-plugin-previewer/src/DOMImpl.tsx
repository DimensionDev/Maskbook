import { setDOMImpl } from 'ef.js'
import type {} from 'react/experimental'
import type {} from 'react-dom/experimental'
import { createReactRootShadowedPartial, ReactRootShadowed } from '@dimensiondev/maskbook-shared'
import * as Components from './Components'

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
    DOM.setAttribute('data-kind', element)

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
    const root: ReactRootShadowed = (shadow as any).__root || ((shadow as any).__root = createReactRootShadowed(shadow))
    root.render(f(props, (event) => void shadow.host.dispatchEvent(event)))
}

const unknown = ['div', ((() => '') as any) as Components.Component<any>] as const

function shouldRender(element: string): readonly [string, Components.Component<any>] {
    for (const F of Object.values(Components)) {
        if (F.displayName === element) return ['main', F]
    }
    return unknown
}
