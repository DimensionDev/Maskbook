import { isTwitter, defineFunctionOnContentObject, unwrapXRayVision, cloneIntoContent } from '../utils.js'
import { $, $Blessed, $Content, bless } from '../../shared/intrinsic.js'

// Do not use Array deconstruct syntax. It might invoke Array.prototype[Symbol.iterator].
type EventListenerDescriptor = { once: boolean; passive: boolean; capture: boolean }

const _CapturingEvents: ReadonlyArray<keyof DocumentEventMap> = [
    'keyup',
    'input',
    'paste',
    'change',
    'readystatechange',
]

const CapturingEvents: ReadonlySet<string> = $Blessed.Set(_CapturingEvents)
const CapturedListeners = $Blessed.WeakMap<EventTarget, Map<string, Map<EventListener, EventListenerDescriptor>>>()

defineFunctionOnContentObject(
    $Content.EventTargetPrototype,
    'addEventListener',
    (raw, currentEventTarget: EventTarget, args: Parameters<EventTarget['addEventListener']>) => {
        const result = $.Reflect.apply(raw, currentEventTarget, args)

        if (!CapturingEvents.has(args[0])) return result
        const { f, type, ...desc } = normalizeAddEventListenerArgs(args)
        if (CapturingEvents.has(type)) {
            if (!CapturedListeners.has(currentEventTarget)) CapturedListeners.set(currentEventTarget, $Blessed.Map())
            const listenerMap = CapturedListeners.get(currentEventTarget)!

            if (!listenerMap.has(type)) listenerMap.set(type, $Blessed.Map())
            const descriptorMap = listenerMap.get(type)!
            descriptorMap.set(f, desc)
        }
        return result
    },
)

defineFunctionOnContentObject(
    $Content.EventTargetPrototype,
    'removeEventListener',
    (raw, currentEventTarget: EventTarget, args: Parameters<EventTarget['removeEventListener']>) => {
        const result = $.Reflect.apply(raw, currentEventTarget, args)

        if (!CapturingEvents.has(args[0])) return result
        const { type, f } = normalizeAddEventListenerArgs(args)
        CapturedListeners.get(currentEventTarget)?.get(type)?.delete(f)

        return result
    },
)

function normalizeAddEventListenerArgs(
    args: Parameters<EventTarget['addEventListener']>,
): EventListenerDescriptor & { type: string; f: EventListener } {
    // avoid Array deconstruct
    const type = args[0]
    const listener = args[1]
    const options = args[2]

    let f: EventListener = () => {}
    if (typeof listener === 'function') f = listener
    else if (typeof listener === 'object' && listener !== null) {
        const _f = listener.handleEvent
        f = (e) => $.Reflect.apply(_f, listener, [e])
    }

    let capture = false
    let passive = false
    let once = false

    if (typeof options === 'boolean') capture = options
    else if (typeof options === 'object' && listener !== null) {
        capture = options.capture || false
        passive = options.passive || false
        once = options.once || false
    }
    return { type, f, once, capture, passive }
}

function dispatchEventTarget_inner(
    target: EventTarget,
    event: Event,
    eventTarget_onEventGetter: () => Function | undefined | null,
) {
    const type = event.type
    if (!CapturingEvents.has(type))
        return $.ConsoleError("[@masknet/injected-script] Trying to send event didn't captured.")

    // TODO: they should be triggered in order.
    try {
        const f = eventTarget_onEventGetter()
        f && $.Reflect.apply(f, target, [event])
    } catch (err) {
        $.ConsoleError(err)
    }

    const listeners = CapturedListeners.get(target)?.get(type)
    if (!listeners) return
    for (const _ of listeners) {
        // avoid Array deconstruct
        if (_[1].capture) continue
        try {
            _[0](event)
        } catch (err) {
            $.ConsoleError(err)
        }
    }
}
export function dispatchMockEvent<T extends Event>(
    target: EventTarget,
    event: T,
    eventTarget_onEventGetter: () => Function | undefined | null,
    overwrite: Partial<T> = {},
) {
    dispatchEventTarget_inner(
        target,
        getMockedEvent(event, () => target, overwrite),
        eventTarget_onEventGetter,
    )
}

export function dispatchMockEventBubble<T extends Event>(
    target: Node | Document | null,
    eventBase: T,
    overwrites: Partial<T> = {},
) {
    let currentTarget: null | Node | Document = target

    // HACK: https://github.com/DimensionDev/Maskbook/pull/4970/ and https://github.com/DimensionDev/Maskbook/pull/5967
    const event = getMockedEvent(eventBase, isTwitter() ? () => target! : () => currentTarget!, overwrites)
    // Note: in firefox, "event" is "Opaque". Displayed as an empty object.

    const bubblingNode = bubble()
    for (const Node of bubblingNode) {
        // TODO: implement
        // Event.prototype.stopPropagation
        // Event.prototype.stopImmediatePropagation
        // Event.prototype.composedPath
        // capture event
        // once event
        // passive event
        // onEvent trigger
        dispatchEventTarget_inner(Node, event, () => undefined)
    }
    function bubble() {
        const g = bubble_unsafe()
        bless(g, $.GeneratorDesc)
        return g
    }
    function* bubble_unsafe() {
        while (currentTarget) {
            yield currentTarget
            currentTarget = $.Node_parentNode_getter(currentTarget)
        }
        yield document
        yield window
    }
}

function getMockedEvent<T extends Event>(event: T, currentTarget: () => EventTarget, overwrites: Partial<T> = {}) {
    const target = unwrapXRayVision(currentTarget())
    const source = {
        target,
        srcElement: target,
        get currentTarget() {
            return unwrapXRayVision(currentTarget())
        },
        // ? Why? It doesn't work without this property.
        // _inherits_from_prototype: true,
        defaultPrevented: false,
        preventDefault: cloneIntoContent(() => {}),
    }
    $.defineProperties(source, $.getOwnPropertyDescriptors(overwrites))
    return new $Content.Proxy(
        event,
        cloneIntoContent({
            get(target, key) {
                if (key in source) return (source as any)[key]
                return (unwrapXRayVision(target) as any)[key]
            },
        }),
    )
}
