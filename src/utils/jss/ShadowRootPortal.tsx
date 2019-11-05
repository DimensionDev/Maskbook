import { livingShadowRoots } from './ConstructableStyleSheetsRenderer'
import { GetContext } from '@holoflows/kit/es'
import { untilDocumentReady } from '../dom'

const div = document.createElement('div')
const shadow = div.attachShadow({ mode: 'closed' })
livingShadowRoots.add(shadow)
untilDocumentReady().then(() => {
    document.body.appendChild(div)
})

globalThis.getComputedStyle = new Proxy(globalThis.getComputedStyle || (() => {}), {
    apply(target, thisArg, args) {
        if (args[0] === proxy) args[0] = document.body
        return Reflect.apply(target, thisArg, args)
    },
})

const proxy = new Proxy(document.body, {
    get(target, key, receiver) {
        const value = Reflect.get(target, key)
        if (typeof value === 'function')
            return function(...args: any[]) {
                console.log(...args)
                return Reflect.apply(value, shadow, args)
            }
        return value
    },
    set(target, key, value, receiver) {
        return Reflect.set(document.body, key, value, document.body)
    },
})
export function PortalShadowRoot() {
    if (GetContext() === 'options') return document.body
    return proxy
}

Object.defineProperties(ShadowRoot.prototype, {
    /**
     *  ConstructableStyleSheetRenderer will check if connected,
     *  if not, the polyfill will not inject style.
     *
     */
    isConnected: {
        get() {
            return true
        },
        configurable: true,
    },
})
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
