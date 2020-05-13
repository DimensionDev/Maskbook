import { GetContext } from '@holoflows/kit/es'
import { untilDomLoaded } from '../dom'
import { renderInShadowRootSettings } from '../../components/shared-settings/settings'

const div = document.createElement('div')
export const portalShadowRoot = div.attachShadow({ mode: 'closed' })
untilDomLoaded().then(() => document.body.appendChild(div))

/**
 * In Firefox content script, globalThis !== window
 * so hack on globalThis is not working.
 * We need to use globalThis insteadof window because this script will also run in SSR.
 */
globalThis.getComputedStyle = new Proxy(
    globalThis?.window?.getComputedStyle || globalThis.getComputedStyle || (() => {}),
    {
        apply(target, thisArg, args) {
            // ! getComputedStyle won't work with proxy
            if (!(args[0] instanceof Element)) args[0] = document.body
            return Reflect.apply(target, thisArg, args)
        },
    },
)
Object.assign(globalThis.window || {}, { getComputedStyle })

let proxy: ShadowRoot | undefined
const handler: ProxyHandler<ShadowRoot> = {
    // ! (1) to make it more like a Document
    // ! (2) to make it more like an Element
    get(target, property, handler) {
        // ! (1) make react move event listeners to shadowroot instead of document
        if (property === 'ownerDocument') return handler

        // ! (2) if it's a function, use ours
        const val = Reflect.get(target, property, target)
        if (typeof val === 'function') return val.bind(target)

        // @ts-ignore
        const doc = document[property]
        // ! (1) document can createElement, createElementNS, etc., so if we don't have such methods, use theirs
        if (typeof val === 'undefined' && typeof doc === 'function') return doc.bind(document)

        // ! (2) if it's not a function, use theirs
        // ! if not return the body version, React will throw in findDOMNode
        // ! if not return the self version, we will have react#18895 problem
        // https://github.com/facebook/react/issues/18895
        // @ts-ignore
        const body = document.body[property]
        // @ts-ignore
        const self = portalShadowRoot[property]
        return body ?? self
    },
    set(target, property, value) {
        return Reflect.set(target, property, value, target)
    },
}

export function PortalShadowRoot() {
    if (GetContext() === 'options') return document.body
    if (globalThis.location.hostname === 'localhost') return document.body
    if (!renderInShadowRootSettings.value) return document.body
    if (!proxy) proxy = new Proxy(portalShadowRoot, handler)
    return (proxy as unknown) as Element
}
