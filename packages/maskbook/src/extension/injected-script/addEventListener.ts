import { CustomEventId } from '../../utils/constants'
import type { CustomEvents } from './CustomEvents'

const CapturingEvents: Set<string> = new Set(['keyup', 'input', 'paste'] as (keyof DocumentEventMap)[])

//#region instincts
const { apply } = Reflect
const { error, log, warn } = console
const isConnectedGetter: () => boolean = Object.getOwnPropertyDescriptor(Node.prototype, 'isConnected')!.get!
const _XPCNativeWrapper = typeof XPCNativeWrapper === 'undefined' ? undefined : XPCNativeWrapper
// The "window."" here is used to create a un-xrayed Proxy on Firefox
const un_xray_Proxy = globalThis.window.Proxy
const input_value_setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set!
const textarea_value_setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set!
//#endregion

//#region helpers
type EventListenerDescriptor = { once: boolean; passive: boolean; capture: boolean }
const CapturedListeners = new WeakMap<Node | Document, Map<string, Map<EventListener, EventListenerDescriptor>>>()
function isNodeConnected(x: unknown) {
    try {
        return isConnectedGetter.call(x)
    } catch {
        return false
    }
}
//#endregion

function dispatchEventRaw<T extends Event>(target: Node | Document | null, eventBase: T, overwrites: Partial<T> = {}) {
    let currentTarget: null | Node | Document = target
    const event = getMockedEvent(eventBase, () => currentTarget!, overwrites)
    // Note: in firefox, "event" is "Opaque". Displayed as an empty object.
    const type = eventBase.type
    if (!CapturingEvents.has(type)) return warn("!!!! You're capturing an event that didn't captured. !!!!")

    const bubblingNode = bubble()
    for (const Node of bubblingNode) {
        // TODO: implement
        // Event.prototype.stopPropagation
        // Event.prototype.stopImmediatePropagation
        // Event.prototype.composedPath
        // capture event
        // once event
        // passive event
        const listeners = CapturedListeners.get(Node)?.get(type)
        if (!listeners) continue
        for (const [f, { capture, once, passive }] of listeners) {
            if (capture) continue
            try {
                f(event)
            } catch (e) {
                error(e)
            }
        }
    }
    function* bubble() {
        while (currentTarget) {
            yield currentTarget
            currentTarget = currentTarget.parentNode
        }
        yield document
        yield (window as unknown) as Node
    }
    function getMockedEvent<T extends Event>(event: T, currentTarget: () => EventTarget, overwrites: Partial<T> = {}) {
        const target = un_xray(currentTarget())
        const source = {
            target,
            srcElement: target,
            // ? Why ?
            _inherits_from_prototype: true,
            defaultPrevented: false,
            preventDefault: clone_into(() => {}),
            ...overwrites,
        }
        return new un_xray_Proxy(
            event,
            clone_into({
                get(target: T, key: keyof T) {
                    if (key === 'currentTarget') return un_xray(currentTarget())
                    return source[key] ?? un_xray(target)[key]
                },
            }),
        )
    }
}

function dispatchPaste(textOrImage: CustomEvents['paste'][0]) {
    const data = new DataTransfer()
    const e = new ClipboardEvent('paste', {
        clipboardData: data,
        // @ts-ignore Firefox only API
        dataType: typeof textOrImage === 'string' ? 'text/plain' : void 0,
        data: typeof textOrImage === 'string' ? textOrImage : void 0,
        bubbles: true,
        cancelable: true,
    })
    if (typeof textOrImage === 'string') {
        data.setData('text/plain', textOrImage)
        document.activeElement!.dispatchEvent(e)
    } else if (textOrImage.type === 'image') {
        const Uint8Array = globalThis.Uint8Array ? globalThis.Uint8Array : globalThis.window.Uint8Array
        const xray_binary = Uint8Array.from(textOrImage.value)
        const xray_blob = new Blob([clone_into(xray_binary)], { type: 'image/png' })
        const file = un_xray(
            new File([un_xray(xray_blob)], 'image.png', {
                lastModified: Date.now(),
                type: 'image/png',
            }),
        )
        const dt = new globalThis.window.Proxy(
            un_xray(data),
            clone_into({
                get(target, key: keyof DataTransfer) {
                    if (key === 'files') return clone_into([file])
                    if (key === 'types') return clone_into(['Files'])
                    if (key === 'items')
                        return clone_into([
                            {
                                kind: 'file',
                                type: 'image/png',
                                getAsFile() {
                                    return file
                                },
                            },
                        ])
                    if (key === 'getData') return clone_into(() => '')
                    return un_xray(target[key])
                },
            }),
        )
        dispatchEventRaw(document.activeElement, e, { clipboardData: dt })
    } else {
        const error = new Error(`Unknown event, got ${textOrImage?.type ?? 'unknown'}`)
        // cause firefox will not display error from extension
        console.error(error)
        throw error
    }
}
function dispatchInput(text: CustomEvents['input'][0]) {
    // Cause react hooks the input.value getter & setter, set hooked version will notify react **not** call the onChange callback.
    {
        let setter = (_value: string) => warn('Unknown active element type', document.activeElement)
        if (document.activeElement instanceof HTMLInputElement) setter = input_value_setter
        else if (document.activeElement instanceof HTMLTextAreaElement) setter = textarea_value_setter
        apply(setter, document.activeElement, [text])
    }
    dispatchEventRaw(
        document.activeElement,
        new globalThis.window.InputEvent('input', clone_into({ inputType: 'insertText', data: text })),
    )
}
if (process.env.NODE_ENV === 'development')
    console.log(`Invoke custom event:`, clone_into({ dispatchInput, dispatchPaste }), CapturedListeners)
document.addEventListener(CustomEventId, (e) => {
    const ev = e as CustomEvent<string>
    const [eventName, param, selector]: [keyof CustomEvents, any[], string] = JSON.parse(ev.detail)
    switch (eventName) {
        case 'input':
            return apply(dispatchInput, null, param)
        case 'paste':
            return apply(dispatchPaste, null, param)
        default:
            warn(eventName, 'not handled')
    }
})

//#region Overwrite EventTarget.prototype.*
redefineEventTargetPrototype(
    'addEventListener',
    (raw, _this: Node, args: Parameters<EventTarget['addEventListener']>) => {
        const result = apply(raw, _this, args)
        if (!CapturingEvents.has(args[0])) return result
        const { f, type, ...desc } = normalizeAddEventListenerArgs(args)
        if (CapturingEvents.has(type)) {
            if (!CapturedListeners.has(_this)) CapturedListeners.set(_this, new Map())
            const map = CapturedListeners.get(_this)!
            if (!map.has(type)) map.set(type, new Map())
            const map2 = map.get(type)!
            map2.set(f, desc)
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
        CapturedListeners.get(_this)?.get(type)?.delete(f)
        return result
    },
)

function redefineEventTargetPrototype<K extends keyof EventTarget>(
    defineAs: K,
    apply: NonNullable<ProxyHandler<EventTarget[K]>['apply']>,
) {
    try {
        if (_XPCNativeWrapper) {
            log('Redefine with Firefox private API, cool!')
            const rawPrototype = _XPCNativeWrapper.unwrap(globalThis.window.EventTarget.prototype)
            const rawFunction = rawPrototype[defineAs]
            exportFunction(
                function (this: any, ...args: unknown[]) {
                    return apply(rawFunction, this, args)
                },
                rawPrototype,
                { defineAs },
            )
            return
        }
    } catch {
        console.error('Redefine failed.')
    }
    EventTarget.prototype[defineAs] = new Proxy(EventTarget.prototype[defineAs], { apply })
}

function normalizeAddEventListenerArgs(
    args: Parameters<EventTarget['addEventListener']>,
): EventListenerDescriptor & { type: string; f: EventListener } {
    const [type, listener, options] = args
    let f: EventListener = () => {}
    if (typeof listener === 'function') f = listener
    else if (typeof listener === 'object') f = listener?.handleEvent.bind(listener) as any

    let capture = false
    if (typeof options === 'boolean') capture = options
    else if (typeof options === 'object') capture = options?.capture ?? false

    let passive = false
    if (typeof options === 'object') passive = options?.passive ?? false

    let once = false
    if (typeof options === 'object') once = options?.once ?? false
    return { type, f, once, capture, passive }
}
//#endregion

//#region Firefox magic
/** get the un xrayed version of a _DOM_ object */
function un_xray<T>(x: T) {
    if (_XPCNativeWrapper) return _XPCNativeWrapper.unwrap(x)
    return x
}

/** Clone a object into the page realm */
function clone_into<T>(x: T) {
    if (typeof cloneInto === 'function') return cloneInto(x, window, { cloneFunctions: true })
    return x
}
/** @see https://mdn.io/XPCNativeWrapper Firefox only */
declare namespace XPCNativeWrapper {
    function unwrap<T>(object: T): T
}
/** @see https://mdn.io/Component.utils.exportFunction Firefox only */
declare function exportFunction(f: Function, target: object, opts: { defineAs: string }): void
/** @see https://mdn.io/Component.utils.cloneInto Firefox only */
declare function cloneInto<T>(f: T, target: object, opts: { cloneFunctions: boolean }): T
//#endregion
