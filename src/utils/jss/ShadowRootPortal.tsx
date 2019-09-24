import { livingShadowRoots } from './ConstructableStyleSheetsRenderer'
import { GetContext } from '@holoflows/kit/es'

const div = document.createElement('div')
document.body.appendChild(div)
export const PortalShadowRoot =
    GetContext() === 'options' ? div : ((div.attachShadow({ mode: 'closed' }) as unknown) as any)
livingShadowRoots.add(PortalShadowRoot as any)

Object.defineProperties(ShadowRoot.prototype, {
    setAttribute: {
        value() {},
        configurable: true,
    },
    removeAttribute: {
        value() {},
        configurable: true,
    },
    /**
     * React will try to find nodeType on this element
     * if not 1 it thought that it was a React Component Instance
     * @see https://github.com/facebook/react/pull/15894
     * and we will got 11 on shadowRoot
     * so a mock is required.
     */
    nodeType: {
        get() {
            if (this === PortalShadowRoot) return 1
            else return Object.getOwnPropertyDescriptor(Node.prototype, 'nodeType')!.get!.call(this)
        },
        configurable: true,
    },
    /**
     * MUI require a tag name for internal implement and thought it was a string.
     * ShadowRoot has no tagName so that a fake tag name defined here.
     */
    tagName: {
        get() {
            if (this === PortalShadowRoot) return 'div'
            else return undefined
        },
        configurable: true,
    },
    /**
     * Material model component will try write style on the shadowRoot and
     * due to lack of style on shadowRoot, it will not work.
     */
    style: {
        get() {
            if (this === PortalShadowRoot) return div.style
            else return undefined
        },
        configurable: true,
    },
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

    function hack(eventName: string, shadowRoot: ShadowRoot) {
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
            hack(eventName, PortalShadowRoot)
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
