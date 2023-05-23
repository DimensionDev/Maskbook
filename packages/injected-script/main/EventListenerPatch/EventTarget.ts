import { defineFunctionOnContentObject } from '../utils.js'
import { $, $Blessed, $Content, isNode, isWindow } from '../intrinsic.js'

export const CapturingEvents: ReadonlySet<string> = $Blessed.Set<keyof DocumentEventMap>([
    'keyup',
    'input',
    'paste',
    'change',
])
export const CapturedListeners: WeakMap<EventTarget, Set<EventListenerDescriptor>> = $Blessed.WeakMap()

// https://dom.spec.whatwg.org/#concept-event-listener
export interface EventListenerDescriptor {
    type: string
    callback: EventListenerObject | EventListener | null
    capture: boolean
    passive: boolean | null
    once: boolean
    signal: AbortSignal | null
    removed: boolean
}

defineFunctionOnContentObject(
    $Content.EventTargetPrototype,
    'addEventListener',
    // https://dom.spec.whatwg.org/#dom-eventtarget-addeventlistener
    (addEventListener, eventTarget: EventTarget, args: Parameters<EventTarget['addEventListener']>) => {
        if (!CapturingEvents.has(args[0])) return $.apply(addEventListener, eventTarget, args)

        const listener = normalizeAddEventListenerArgs(args)

        const native_result = $.apply(
            addEventListener,
            eventTarget,
            $.cloneIntoContent([
                listener.type,
                listener.callback,
                {
                    capture: listener.capture,
                    once: listener.once,
                    passive: listener.passive === null ? undefined : listener.passive,
                    signal: listener.signal === null ? undefined : listener.signal,
                } satisfies AddEventListenerOptions,
            ]),
        )

        // https://dom.spec.whatwg.org/#add-an-event-listener
        // (Skip) If eventTarget is a ServiceWorkerGlobalScope object, ...
        if (listener.signal !== null && $.AbortSignal_aborted(listener.signal)) return
        if (listener.callback === null) return
        if (listener.passive === null) {
            // https://dom.spec.whatwg.org/#default-passive-value
            if (
                listener.type === 'touchstart' ||
                listener.type === 'touchmove' ||
                listener.type === 'wheel' ||
                listener.type === 'mousewheel'
            ) {
                listener.passive = true
            } else if (isWindow(eventTarget)) {
                listener.passive = true
            } else if (isNode(eventTarget)) {
                const nodeDocument = $.Node_ownerDocument(eventTarget)
                if (
                    // or is a node whose node document is eventTarget
                    nodeDocument === eventTarget ||
                    // or is a node whose node document's document element is eventTarget
                    $.Node_parentNode(eventTarget) === nodeDocument ||
                    // or is a node whose node document's body element is eventTarget.
                    (nodeDocument && $.Document_body(nodeDocument) === eventTarget)
                ) {
                    listener.passive = true
                }
            } else listener.passive = false
        }
        if (!CapturedListeners.has(eventTarget)) CapturedListeners.set(eventTarget, $Blessed.Set())
        const listenerList = CapturedListeners.get(eventTarget)!

        // If eventTarget's event listener list does not contain an event listener whose ...
        {
            let exist = false
            for (const _ of listenerList) {
                if (_.type === listener.type && _.capture === listener.capture && _.callback === listener.callback) {
                    exist = true
                    break
                }
            }
            if (!exist) listenerList.add(listener)
        }

        if (listener.signal !== null) {
            $.apply(addEventListener, listener.signal, [
                'abort',
                $.bind(RemoveListener, null, listener, listenerList),
                {
                    __proto__: null,
                    once: true,
                },
            ])
        }
        return native_result
    },
)

defineFunctionOnContentObject(
    $Content.EventTargetPrototype,
    'removeEventListener',
    (removeEventListener, eventTarget: EventTarget, args: Parameters<EventTarget['removeEventListener']>) => {
        if (!CapturingEvents.has(args[0])) return $.apply(removeEventListener, eventTarget, args)

        let capture = false
        {
            const arg = args[2]
            if (typeof arg === 'boolean') capture = arg
            else if (typeof arg === 'object' && arg) capture = $.Boolean(arg.capture)
        }

        const listenerList = CapturedListeners.get(eventTarget)
        if (!listenerList) return

        for (const listener of listenerList) {
            if (listener.type === args[0] && listener.capture === capture && listener.callback === args[1]) {
                RemoveListener(listener, listenerList)
            }
        }
    },
)

export function RemoveListener(listener: EventListenerDescriptor, listenerList: Set<EventListenerDescriptor>) {
    // (Skip) If eventTarget is a ServiceWorkerGlobalScope object ...
    listener.removed = true
    listenerList.delete(listener)
}

function normalizeAddEventListenerArgs(args: Parameters<EventTarget['addEventListener']>): EventListenerDescriptor {
    // avoid Array deconstruct
    const type = args[0]
    const callback = args[1]
    const options = args[2]

    // https://dom.spec.whatwg.org/#event-flatten-more
    const capture = $.Boolean(typeof options === 'boolean' ? options : options?.capture ?? false)
    let once = false
    let passive: boolean | null = null
    let signal: AbortSignal | null = null

    if (typeof options === 'object' && options) {
        once = Boolean(options.once)
        if ($.hasOwn(options, 'passive')) passive = Boolean(options.passive)
        if ($.hasOwn(options, 'signal')) {
            signal = options.signal!
            // don't verify signal's internal slot. it will be verified later
        }
    }

    return { type, callback, once, capture, passive, removed: false, signal }
}
