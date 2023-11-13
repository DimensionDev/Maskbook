import { takeThisF } from './intrinsic_content.js'

function noop() {}

/** Clone a high privileged object into an unsafe one. This uses structuredClone on Firefox.  */
export const structuredCloneFromSafe: <T extends object>(value: T) => T =
    typeof cloneInto === 'function' ?
        function (value) {
            return cloneInto!(value, window, {
                __proto__: null,
                cloneFunctions: true,
            })
        }
    :   globalThis.Object
/** Clone a high privileged object into an unsafe one. This uses structuredClone on Firefox.  */
export const structuredCloneFromSafeReal: <T extends object>(value: T) => T =
    typeof cloneInto === 'function' ?
        function (value) {
            return cloneInto!(value, window, {
                __proto__: null,
                cloneFunctions: true,
            })
        }
    :   globalThis.structuredClone || globalThis.Object
export const unwrapXRayVision: <const T extends object>(value: T) => T =
    typeof XPCNativeWrapper !== 'undefined' ? XPCNativeWrapper.unwrap.bind(XPCNativeWrapper) : window.Object
export const empty: NullPrototype = unwrapXRayVision(structuredCloneFromSafe({ __proto__: null }))
window.Object.freeze(empty)
// TODO: use the original info?
export const expose: <T extends (...args: any[]) => any>(f: T, original?: T) => T =
    typeof exportFunction === 'function' ?
        (f) => new Proxy(exportFunction!(f, window), empty)
    :   (f) => new Proxy(f, empty)

// The "window" here means another Realm in Firefox
export const {
    // ECMAScript
    Object,
    TypeError,
    Proxy,
} = window
export const Array_values = takeThisF(window.Array.prototype.values)<readonly unknown[]>
export const reportError = takeThisF(window.reportError)<Window> || noop

const _window = window
export { _window as window }

/** Return the unsafe object without XRayVision from the main Realm. */
export class NewObject {
    constructor() {
        // eslint-disable-next-line no-constructor-return
        return unwrapXRayVision(new Object())
    }
}
