import { livingShadowRoots, applyAdoptedStyleSheets } from './ConstructableStyleSheetsRenderer'
import { GetContext } from '@holoflows/kit/es'
import { untilDocumentReady } from '../dom'

const div = document.createElement('div')
const shadow = div.attachShadow({ mode: 'closed' })
untilDocumentReady().then(() => document.body.appendChild(div))
livingShadowRoots.add(shadow)

globalThis.getComputedStyle = new Proxy(globalThis.getComputedStyle || (() => {}), {
    apply(target, thisArg, args) {
        if (args[0] === proxy) args[0] = document.body
        return Reflect.apply(target, thisArg, args)
    },
})

let proxy: HTMLElement | undefined

export function PortalShadowRoot() {
    if (GetContext() === 'options') return document.body
    if (globalThis.location.hostname === 'localhost') return document.body
    if (!proxy)
        proxy = new Proxy(document.body, {
            get(target, key, receiver) {
                const value = Reflect.get(target, key)
                if (typeof value === 'function')
                    return function(...args: any[]) {
                        return Reflect.apply(value, shadow, args)
                    }
                return value
            },
            set(target, key, value, receiver) {
                return Reflect.set(document.body, key, value, document.body)
            },
        })
    return proxy
}

{
    // ? Hack for React, let event go through ShadowDom
    const hackingEvents = new WeakMap<Event, EventTarget[]>()

    function hack(eventName: string, shadowRoot: ShadowRoot | Element) {
        shadowRoot.addEventListener(eventName, (e: Event) => {
            if (hackingEvents.has(e)) return
            const path = e.composedPath()
            // @ts-ignore
            const e2 = new e.constructor(e.type, e)
            hackingEvents.set(e2, path)
            shadowRoot.dispatchEvent(e2)
            e.stopPropagation()
            e.stopImmediatePropagation()
        })
    }

    // ? If react listen to some event, we also hack it.
    document.addEventListener = new Proxy(document.addEventListener, {
        apply(target, thisArg, args) {
            const [eventName, listener, options] = args
            hack(eventName, shadow)
            return target.apply(thisArg, args)
        },
    })
    const nativeTarget = Object.getOwnPropertyDescriptor(Event.prototype, 'target')!.get!
    Object.defineProperty(Event.prototype, 'target', {
        get() {
            if (hackingEvents.has(this)) return hackingEvents.get(this)![0]
            return nativeTarget.call(this)
        },
    })
}
