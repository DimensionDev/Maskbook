import { CustomEventId, encodeEvent, InternalEvents } from '../shared/index.js'
import { $NoXRay, $ } from './intrinsic.js'

// Firefox magics!
export function overwriteFunctionOnXRayObject<T extends object>(
    xray_object: T,
    defineAs: keyof T,
    apply: (target: any, thisArg: any, argArray?: any) => any,
) {
    try {
        if ($.XPCNativeWrapper) {
            const rawObject = $.XPCNativeWrapper.unwrap(xray_object)
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
        $.ConsoleError('Redefine failed. Try to use Proxy as fallback.')
    }
    xray_object[defineAs] = new $NoXRay.Proxy(xray_object[defineAs], { apply })
}

export function redefineEventTargetPrototype<K extends keyof EventTarget>(
    defineAs: K,
    apply: NonNullable<ProxyHandler<EventTarget[K]>['apply']>,
) {
    overwriteFunctionOnXRayObject($NoXRay.EventTargetPrototype, defineAs, apply)
}

/** get the xray-unwrapped version of a C++ binding object */
export function unwrapXRay_CPPBindingObject<T>(x: T) {
    if ($.XPCNativeWrapper) return $.XPCNativeWrapper.unwrap(x)
    return x
}

/** Clone a object into the page realm */
export function clone_into<T>(x: T) {
    if ($.XPCNativeWrapper && typeof cloneInto === 'function') return cloneInto(x, window, { cloneFunctions: true })
    return x
}

export function constructXrayUnwrappedDataTransferProxy(xrayUnwrappedFile: File) {
    return new $NoXRay.Proxy(
        new $NoXRay.DataTransfer(),
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
    const blob = new $NoXRay.Blob([binary], { type: format })
    const file = new $NoXRay.File([blob], fileName, {
        lastModified: $.DateNow(),
        type: format,
    })
    return file
}

function getError(message: any) {
    try {
        return { message: message.message }
    } catch {
        return { message: 'unknown error' }
    }
}
export async function handlePromise(id: number, promise: () => any) {
    try {
        const data = await promise()
        sendEvent('resolvePromise', id, data)
    } catch (error) {
        sendEvent('rejectPromise', id, getError(error))
    }
}

export function sendEvent<T extends keyof InternalEvents>(event: T, ...args: InternalEvents[T]) {
    const detail = encodeEvent(event, args)
    $NoXRay.dispatchEvent(document, new $NoXRay.CustomEvent(CustomEventId, { detail }))
}

export function isTwitter() {
    const url = new $.URL(window.location.href)
    return $.StringInclude($.URL_origin_getter(url), 'twitter.com')
}
