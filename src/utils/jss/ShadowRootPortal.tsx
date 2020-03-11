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
        // ! (1) document can createElement, createElementNS, etc., so if we don't have such methods, use theirs
        if (typeof val === 'undefined' && typeof document[property] === 'function')
            // @ts-ignore
            return document[property].bind(document)

        // ! (2) if it's not a function, use theirs
        // @ts-ignore
        return document.body[property]
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

// ? do we still need this?
// // ? Hack for React, let event go through ShadowDom
// const shadowRoots = new WeakMap<Node, WeakMap<Event, EventTarget[]>>()

// export function hackEvent(eventName: string, shadowRoot: ShadowRoot | Element) {
//     let hackingEvents: WeakMap<Event, EventTarget[]>
//     if (shadowRoots.has(shadowRoot)) hackingEvents = shadowRoots.get(shadowRoot)!
//     else shadowRoots.set(shadowRoot, (hackingEvents = new WeakMap()))
//     shadowRoot.addEventListener(eventName, (e: Event) => {
//         if (hackingEvents.has(e)) return
//         const path = e.composedPath()
//         // @ts-ignore
//         const e2 = new e.constructor(e.type, e)
//         hackingEvents.set(e2, path)
//         shadowRoot.dispatchEvent(e2)
//         e.stopPropagation()
//         e.stopImmediatePropagation()
//     })
// }

// // ? If react listen to some event, we also hack it.
// document.addEventListener = new Proxy(document.addEventListener, {
//     apply(target, thisArg, args) {
//         const [eventName, listener, options] = args
//         debugger
//         livingShadowRoots.forEach(shadowRoot => hackEvent(eventName, shadowRoot))
//         return target.apply(thisArg, args)
//     },
// })
// const nativeTarget = Object.getOwnPropertyDescriptor(Event.prototype, 'target')!.get!
// Object.defineProperty(Event.prototype, 'target', {
//     get() {
//         if (hackingEvents.has(this)) return hackingEvents.get(this)![0]
//         return nativeTarget.call(this)
//     },
// })
