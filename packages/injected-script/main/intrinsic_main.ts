import { getOwnPropertyDescriptors, takeThis } from './intrinsic_content.js'

// The "window" here means another Realm in Firefox
export const {
    // ECMAScript
    Object,
    Array,
    TypeError,
    Proxy,
    // Web
    Event,
    DataTransfer,
    ClipboardEvent,
    CustomEvent,
    InputEvent,
    Blob,
    File,
    EventTarget,
    DOMException,
} = window
export const apply = window.Reflect.apply
export const reportError = takeThis(window.reportError)<Window> || (() => {})
export const dispatchEvent = takeThis(window.dispatchEvent)<EventTarget>

export const setTimeout = window.setTimeout.bind(window)
export const clearTimeout = window.clearTimeout.bind(window)
export const EventPrototype = window.Event.prototype
export const EventPrototypeDesc = getOwnPropertyDescriptors(EventPrototype)
export const ClipboardEventPrototype = window.ClipboardEvent.prototype
export const ClipboardEventPrototypeDesc = getOwnPropertyDescriptors(ClipboardEventPrototype)
export const UIEventPrototype = window.UIEvent.prototype
export const UIEventPrototypeDesc = getOwnPropertyDescriptors(UIEventPrototype)
export const InputEventPrototype = window.InputEvent.prototype
export const InputEventPrototypeDesc = getOwnPropertyDescriptors(InputEventPrototype)

export const EventTargetPrototype = window.EventTarget.prototype
export const removeListener = takeThis(window.removeEventListener)<EventTarget>
export const XMLHttpRequestPrototype = window.XMLHttpRequest.prototype
const _window = window
export { _window as window }
