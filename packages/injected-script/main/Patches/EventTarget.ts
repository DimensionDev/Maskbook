import { PatchDescriptor } from '../utils.js'
import { $, $safe, isNode, isWindow } from '../intrinsic.js'

export const CapturingEvents: ReadonlySet<string> = $safe.Set<keyof DocumentEventMap>([
    'keyup',
    'input',
    'paste',
    'change',
])
export const CapturedListeners: WeakMap<EventTarget, Set<EventListenerDescriptor>> = $safe.WeakMap()

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

function addEventListener(
    this: EventTarget,
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions | undefined,
) {
    const original = $.EventTargetPrototypeDesc.addEventListener.value!
    if (
        callback === null ||
        (typeof callback !== 'object' && typeof callback !== 'function') ||
        !CapturingEvents.has(type)
    ) {
        return $.apply(original, this, arguments)
    }

    // validate eventTarget is a EventTarget
    $.apply(original, this, ['', null!])
    const listener = normalizeAddEventListenerArgs(type, callback, options)

    const native_result = $.addEventListener(this, listener.type, listener.callback, {
        __proto__: null,
        capture: listener.capture,
        once: listener.once,
        passive: listener.passive === null ? undefined : listener.passive,
        signal: listener.signal === null ? undefined : listener.signal,
    } satisfies AddEventListenerOptions)

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
        } else if (isWindow(this)) {
            listener.passive = true
        } else if (isNode(this)) {
            const nodeDocument = $.Node_ownerDocument(this)
            if (
                // or is a node whose node document is eventTarget
                nodeDocument === this ||
                // or is a node whose node document's document element is eventTarget
                $.Node_parentNode(this) === nodeDocument ||
                // or is a node whose node document's body element is eventTarget.
                (nodeDocument && $.Document_body(nodeDocument) === this)
            ) {
                listener.passive = true
            }
        } else listener.passive = false
    }
    if (!CapturedListeners.has(this)) CapturedListeners.set(this, $safe.Set())
    const listenerList = CapturedListeners.get(this)!

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
        $.addEventListener(listener.signal, 'abort', $.bind(RemoveListener, null, listener, listenerList), {
            __proto__: null,
            once: true,
        })
    }
    return native_result
}

function removeEventListener(
    this: EventTarget,
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions | undefined,
) {
    const original = $.EventTargetPrototypeDesc.removeEventListener.value!
    if (!CapturingEvents.has(type)) return $.apply(original, this, arguments)

    // validate eventTarget is a EventTarget
    $.apply(original, this, ['', null!])

    let capture = false
    if (typeof options === 'boolean') capture = options
    else if (typeof options === 'object' && options) capture = $.Boolean(options.capture)

    const listenerList = CapturedListeners.get(this)
    if (!listenerList) return

    for (const listener of listenerList) {
        if (listener.type === type && listener.capture === capture && listener.callback === callback) {
            RemoveListener(listener, listenerList)
        }
    }
}

PatchDescriptor(
    {
        __proto__: null!,
        addEventListener: { value: addEventListener },
        removeEventListener: { value: removeEventListener },
    },
    $.EventTargetPrototype,
)

export function RemoveListener(listener: EventListenerDescriptor, listenerList: Set<EventListenerDescriptor>) {
    // (Skip) If eventTarget is a ServiceWorkerGlobalScope object ...
    listener.removed = true
    listenerList.delete(listener)
}

function normalizeAddEventListenerArgs(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions | undefined,
): EventListenerDescriptor {
    // https://dom.spec.whatwg.org/#event-flatten-more
    const capture = $.Boolean(typeof options === 'boolean' ? options : (options?.capture ?? false))
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
