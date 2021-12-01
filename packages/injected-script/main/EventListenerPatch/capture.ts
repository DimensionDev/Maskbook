import { clone_into, redefineEventTargetPrototype, unwrapXRay_CPPBindingObject } from '../utils'
import { apply, error, no_xray_Proxy, warn, xray_Map } from '../intrinsic'

const CapturingEvents: Set<string> = new Set(['keyup', 'input', 'paste', 'change'] as (keyof DocumentEventMap)[])

type EventListenerDescriptor = { once: boolean; passive: boolean; capture: boolean }
const CapturedListeners = new WeakMap<Node | Document, Map<string, Map<EventListener, EventListenerDescriptor>>>()
// saving intrinsic of WeakMap, covert it from prototype method to own property.
CapturedListeners.get = CapturedListeners.get
CapturedListeners.set = CapturedListeners.set
CapturedListeners.delete = CapturedListeners.delete
CapturedListeners.has = CapturedListeners.has

redefineEventTargetPrototype(
    'addEventListener',
    (raw, currentEventTarget: Node, args: Parameters<EventTarget['addEventListener']>) => {
        const result = apply(raw, currentEventTarget, args)
        if (!CapturingEvents.has(args[0])) return result
        const { f, type, ...desc } = normalizeAddEventListenerArgs(args)
        if (CapturingEvents.has(type)) {
            if (!CapturedListeners.has(currentEventTarget)) CapturedListeners.set(currentEventTarget, xray_Map())
            const listenerMap = CapturedListeners.get(currentEventTarget)!

            if (!listenerMap.has(type)) listenerMap.set(type, xray_Map())
            const descriptorMap = listenerMap.get(type)!
            descriptorMap.set(f, desc)
        }
        return result
    },
)
redefineEventTargetPrototype(
    'removeEventListener',
    (raw, _this: Node, args: Parameters<EventTarget['removeEventListener']>) => {
        const result = apply(raw, _this, args)
        if (!CapturingEvents.has(args[0])) return result
        const { type, f } = normalizeAddEventListenerArgs(args)
        block: {
            // Avoid ?. here because the transform result contains unsafe intrinsic access to Array.prototype.@@iterator
            const _a = CapturedListeners.get(_this)
            if (!_a) break block
            const _b = _a.get(type)
            if (!_b) break block
            _b.delete(f)
        }
        return result
    },
)

function normalizeAddEventListenerArgs(
    args: Parameters<EventTarget['addEventListener']>,
): EventListenerDescriptor & { type: string; f: EventListener } {
    // Do not use deconstruct syntax. It might invoke Array.prototype[Symbol.iterator]
    const type = args[0]
    const listener = args[1]
    const options = args[2]

    let f: EventListener = () => {}
    if (typeof listener === 'function') f = listener
    else if (typeof listener === 'object' && listener !== null) {
        const _f = listener.handleEvent
        f = (e) => apply(_f, listener, [e])
    }

    let capture = false
    let passive = false
    let once = false

    if (typeof options === 'boolean') capture = options
    else if (typeof options === 'object' && listener !== null) {
        // We can trigger getter here. It's safe because we're following the spec here.
        capture = options.capture || false
        passive = options.passive || false
        once = options.once || false
    }
    return { type, f, once, capture, passive }
}

export function dispatchEventRaw<T extends Event>(
    target: Node | Document | null,
    eventBase: T,
    overwrites: Partial<T> = {},
) {
    let currentTarget: null | Node | Document = target
    const event = getMockedEvent(eventBase, () => currentTarget!, overwrites)
    // Note: in firefox, "event" is "Opaque". Displayed as an empty object.
    const type = eventBase.type
    if (!CapturingEvents.has(type)) return warn("[@masknet/injected-script] Trying to send event didn't captured.")

    const bubblingNode = bubble()
    // TODO: save intrinsic of %GeneratorPrototype.next%
    for (const Node of bubblingNode) {
        // TODO: implement
        // Event.prototype.stopPropagation
        // Event.prototype.stopImmediatePropagation
        // Event.prototype.composedPath
        // capture event
        // once event
        // passive event
        // Avoid using ?. here.
        const _a = CapturedListeners.get(Node)
        if (!_a) continue
        const listeners = _a.get(type)
        if (!listeners) continue
        // TODO: save intrinsic of %ArrayPrototype.@@iterator%
        for (const [fn, { capture }] of listeners) {
            if (capture) continue
            try {
                fn(event)
            } catch (err) {
                error(err)
            }
        }
    }
    function* bubble() {
        while (currentTarget) {
            yield currentTarget
            // TODO: save intrinsic of %NodePrototype.parentNode%
            currentTarget = currentTarget.parentNode
        }
        yield document
        yield window as unknown as Node
    }
    function getMockedEvent<T extends Event>(event: T, currentTarget: () => EventTarget, overwrites: Partial<T> = {}) {
        const target = unwrapXRay_CPPBindingObject(currentTarget())
        const source = {
            target,
            srcElement: target,
            // ? Why? It doesn't work without this property.
            _inherits_from_prototype: true,
            defaultPrevented: false,
            preventDefault: clone_into(() => {}),
            ...overwrites,
        }
        return new no_xray_Proxy(
            event,
            clone_into({
                get(target, key) {
                    if (key === 'currentTarget' || (key === 'target' && isTwitter()))
                        return unwrapXRay_CPPBindingObject(currentTarget())
                    return (source as any)[key] ?? (unwrapXRay_CPPBindingObject(target) as any)[key]
                },
            }),
        )
    }
}

function isTwitter(): Boolean {
    return window.location.href.includes('twitter.com')
}
