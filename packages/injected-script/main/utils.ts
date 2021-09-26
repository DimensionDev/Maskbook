import { error, _XPCNativeWrapper, no_xray_Proxy, no_xray_DataTransfer } from './intrinsic'

const { Blob: no_xray_Blob, File: no_xray_File } = globalThis.window
const EventTargetPrototype = globalThis.window.EventTarget.prototype
const { now } = Date
// Firefox magics!
export function overwriteFunctionOnXRayObject<T extends object>(
    xray_object: T,
    defineAs: keyof T,
    apply: (target: any, thisArg: any, argArray?: any) => any,
) {
    try {
        if (_XPCNativeWrapper) {
            const rawObject = _XPCNativeWrapper.unwrap(xray_object)
            const rawFunction = rawObject[defineAs]
            exportFunction!(
                function (this: any) {
                    return apply(rawFunction, this, arguments)
                },
                rawObject,
                { defineAs },
            )
            return
        }
    } catch {
        error('Redefine failed. Try to use Proxy as fallback.')
    }
    xray_object[defineAs] = new no_xray_Proxy(xray_object[defineAs], { apply })
}

export function redefineEventTargetPrototype<K extends keyof EventTarget>(
    defineAs: K,
    apply: NonNullable<ProxyHandler<EventTarget[K]>['apply']>,
) {
    overwriteFunctionOnXRayObject(EventTargetPrototype, defineAs, apply)
}

/** get the xray-unwrapped version of a C++ binding object */
export function unwrapXRay_CPPBindingObject<T>(x: T) {
    if (_XPCNativeWrapper) return _XPCNativeWrapper.unwrap(x)
    return x
}

/** Clone a object into the page realm */
export function clone_into<T>(x: T) {
    if (_XPCNativeWrapper && typeof cloneInto === 'function') return cloneInto(x, window, { cloneFunctions: true })
    return x
}

export function constructXrayUnwrappedDataTransferProxy(xrayUnwrappedFile: File) {
    return new no_xray_Proxy(
        new no_xray_DataTransfer(),
        clone_into({
            get(target, key: keyof DataTransfer) {
                if (key === 'files') return clone_into([xrayUnwrappedFile])
                if (key === 'types') return clone_into(['Files'])
                if (key === 'items')
                    return clone_into([
                        {
                            kind: 'file',
                            type: 'image/png',
                            getAsFile() {
                                return xrayUnwrappedFile
                            },
                        },
                    ])
                if (key === 'getData') return clone_into(() => '')
                return target[key]
            },
        }),
    )
}

export function constructXrayUnwrappedFilesFromUintLike(
    format: string,
    fileName: string,
    xray_fileContent: number[] | Uint8Array,
) {
    const binary = unwrapXRay_CPPBindingObject(Uint8Array.from(xray_fileContent))
    const blob = new no_xray_Blob([binary], { type: format })
    const file = new no_xray_File([blob], fileName, {
        lastModified: now(),
        type: format,
    })
    return file
}
