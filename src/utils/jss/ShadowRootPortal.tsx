import { livingShadowRoots } from './ConstructableStyleSheetsRenderer'

const div = document.createElement('div')
document.body.appendChild(div)
export const PortalShadowRoot = (div.attachShadow({ mode: 'closed' }) as unknown) as any
livingShadowRoots.add(PortalShadowRoot as any)

Object.defineProperty(ShadowRoot.prototype, 'nodeType', {
    get() {
        if (this === PortalShadowRoot) return 1
        else return Object.getOwnPropertyDescriptor(Node.prototype, 'nodeType')!.get!.call(this)
    },
})
Object.defineProperty(ShadowRoot.prototype, 'tagName', {
    get() {
        if (this === PortalShadowRoot) return 'div'
        else return undefined
    },
})
Object.defineProperty(ShadowRoot.prototype, 'style', {
    get() {
        if (this === PortalShadowRoot) return div.style
        else return undefined
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
