// Firefox magics!
const _XPCNativeWrapper = typeof XPCNativeWrapper === 'undefined' ? undefined : XPCNativeWrapper
export function overwriteFunctionOnXRayObject<T extends object>(
    xrayed_object: T,
    defineAs: keyof T,
    apply: (target: any, thisArg: any, argArray?: any) => any,
) {
    try {
        if (_XPCNativeWrapper) {
            const rawObject = _XPCNativeWrapper.unwrap(xrayed_object)
            const rawFunction = rawObject[defineAs]
            exportFunction(
                function (this: any) {
                    return apply(rawFunction, this, arguments)
                },
                rawObject,
                { defineAs },
            )
            return
        }
    } catch {
        console.error('Redefine failed.')
    }
    xrayed_object[defineAs] = new Proxy(xrayed_object[defineAs], { apply })
}
export function redefineEventTargetPrototype<K extends keyof EventTarget>(
    defineAs: K,
    apply: NonNullable<ProxyHandler<EventTarget[K]>['apply']>,
) {
    overwriteFunctionOnXRayObject(globalThis.window.EventTarget.prototype, defineAs, apply)
}
/** get the un xrayed version of a _DOM_ object */
export function un_xray_DOM<T>(x: T) {
    if (_XPCNativeWrapper) return _XPCNativeWrapper.unwrap(x)
    return x
}

/** Clone a object into the page realm */
export function clone_into<T>(x: T) {
    if (_XPCNativeWrapper && typeof cloneInto === 'function') return cloneInto(x, window, { cloneFunctions: true })
    return x
}
/** @see https://mdn.io/XPCNativeWrapper Firefox only */
declare namespace XPCNativeWrapper {
    function unwrap<T>(object: T): T
}
/** @see https://mdn.io/Component.utils.exportFunction Firefox only */
declare function exportFunction(f: Function, target: object, opts: { defineAs: string | number | symbol }): void
/** @see https://mdn.io/Component.utils.cloneInto Firefox only */
declare function cloneInto<T>(f: T, target: object, opts: { cloneFunctions: boolean }): T
