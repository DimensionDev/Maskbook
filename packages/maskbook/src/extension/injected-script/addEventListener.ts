/**
 * ! Please be super cautious when you're editing this file.
 *
 * ! Please make sure you know how JavaScript property access, getter/setter, Proxy, property descriptor works
 *
 * ! Please make sure you understand how Firefox content script security boundary works
 *
 * ! Please be aware that globalThis is NOT the same as globalThis.window (or window for short) in Firefox.
 */
import { CustomEventId } from '../../utils/constants'
import type { CustomEvents } from './CustomEvents'
import { instagramUpload } from './instagramUpload'
import {
    redefineEventTargetPrototype,
    clone_into,
    un_xray_DOM as un_xray_DOM,
    constructUnXrayedFilesFromUintLike,
    constructUnXrayedDataTransferProxy,
} from './utils'

const CapturingEvents: Set<string> = new Set(['keyup', 'input', 'paste'] as (keyof DocumentEventMap)[])

//#region instincts
const { apply } = Reflect
const { error, warn } = console
// The "window."" here is used to create a un-xrayed Proxy on Firefox
const un_xray_Proxy = globalThis.window.Proxy
const input_value_setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set!
const textarea_value_setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set!
//#endregion

//#region helpers
type EventListenerDescriptor = { once: boolean; passive: boolean; capture: boolean }
const CapturedListeners = new WeakMap<Node | Document, Map<string, Map<EventListener, EventListenerDescriptor>>>()
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
            currentTarget = currentTarget.parentNode
        }
        yield document
        yield window as unknown as Node
    }
    function getMockedEvent<T extends Event>(event: T, currentTarget: () => EventTarget, overwrites: Partial<T> = {}) {
        const target = un_xray_DOM(currentTarget())
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
                get(target, key) {
                    if (key === 'currentTarget') return un_xray_DOM(currentTarget())
                    return (source as any)[key] ?? (un_xray_DOM(target) as any)[key]
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
        const file = constructUnXrayedFilesFromUintLike('image/png', 'image.png', textOrImage.value)
        const dt = constructUnXrayedDataTransferProxy(file)
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
    console.log(
        `Invoke custom event:`,
        clone_into({ dispatchInput, dispatchPaste, instagramUpload }),
        CapturedListeners,
    )
document.addEventListener(CustomEventId, (e) => {
    const ev = e as CustomEvent<string>
    const [eventName, param, selector]: [keyof CustomEvents, any[], string] = JSON.parse(ev.detail)
    switch (eventName) {
        case 'input':
            return apply(dispatchInput, null, param)
        case 'paste':
            return apply(dispatchPaste, null, param)
        case 'instagramUpload':
            return apply(instagramUpload, null, param)
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
