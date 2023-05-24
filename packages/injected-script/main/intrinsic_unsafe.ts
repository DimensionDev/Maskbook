import { getOwnPropertyDescriptors, takeThisF } from './intrinsic_content.js'
import { noop } from './utils.js'

export const fromSafe: <const T>(value: T) => T =
    typeof cloneInto === 'function'
        ? function (value) {
              return cloneInto!(value, window, {
                  __proto__: null,
                  cloneFunctions: true,
              })
          }
        : globalThis.Object
export const expose: <T extends (...args: any[]) => any>(f: T) => T =
    typeof exportFunction === 'function'
        ? (f) => new Proxy(exportFunction!(f, window), empty)
        : (f) => new Proxy(f, empty)

export const unwrap: <T extends object>(obj: T) => T =
    typeof XPCNativeWrapper === 'function'
        ? function (obj) {
              return (obj as any).wrappedJSObject || obj
          }
        : globalThis.Object
export const empty: NullPrototype = unwrap(fromSafe({ __proto__: null }))
window.Object.freeze(empty)
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
export const reportError = takeThisF(window.reportError)<Window> || noop

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
export const EventTargetPrototypeDesc = getOwnPropertyDescriptors(EventTargetPrototype)
export const { pushState, replaceState } = window.history
export const HistoryPrototype = window.History.prototype
const _window = window
export { _window as window }
