import { takeThisF } from './intrinsic_content.js'
import { noop } from './utils.js'

/** Clone a high privileged object into an unsafe one. This uses structuredClone on Firefox.  */
export const structuredCloneFromSafe: <T extends object>(value: T) => T =
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
export const unwrapXRayVision: <const T extends object>(value: T) => T =
    typeof XPCNativeWrapper !== 'undefined' ? XPCNativeWrapper.unwrap.bind(XPCNativeWrapper) : window.Object
export const empty: NullPrototype = unwrapXRayVision(structuredCloneFromSafe({ __proto__: null }))
window.Object.freeze(empty)
// The "window" here means another Realm in Firefox
export const {
    // ECMAScript
    Object,
    TypeError,
    Proxy,
} = window
export const reportError = takeThisF(window.reportError)<Window> || noop

const _window = window
export { _window as window }
