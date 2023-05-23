import { CustomEventId, encodeEvent, type InternalEvents } from '../shared/index.js'
import { $Content, $, $Blessed } from './intrinsic.js'
import { exportFunction, cloneInto, XPCNativeWrapper } from './intrinsic_content.js'

export function cloneIntoContent<T>(obj: T) {
    if (typeof obj === 'function') {
        if (exportFunction) return exportFunction(obj, $Content.window)
        return obj
    } else {
        if (cloneInto) return cloneInto(obj, $Content.window, { cloneFunctions: true })
        return obj
    }
}

export function defineFunctionOnContentObject<T extends object>(
    contentObject: T,
    key: keyof T,
    apply: (target: any, thisArg: any, argArray?: any) => any,
) {
    // Firefox magics!
    if (XPCNativeWrapper) {
        const rawObject = XPCNativeWrapper.unwrap(contentObject)
        const rawFunction = rawObject[key]
        exportFunction!(
            function (this: any) {
                return apply(rawFunction, this, arguments)
            },
            rawObject,
            { defineAs: key },
        )
        return
    }
    contentObject[key] = new $Content.Proxy(contentObject[key], {
        // @ts-expect-error null prototype
        __proto__: null,
        apply,
    })
}

export function unwrapXRayVision<T>(x: T) {
    return $.XPCNativeWrapper?.unwrap(x) ?? x
}

export function contentFileFromBufferSource(format: string, fileName: string, xray_fileContent: number[] | Uint8Array) {
    const binary = unwrapXRayVision(Uint8Array.from(xray_fileContent))
    const blob = new $Content.Blob($Blessed.Array(binary), {
        // @ts-expect-error null prototype
        __proto__: null,
        type: format,
    })
    const file = new $Content.File($Blessed.Array(blob), fileName, {
        // @ts-expect-error null prototype
        __proto__: null,
        lastModified: $.DateNow(),
        type: format,
    })
    return file
}

function getError(message: any) {
    try {
        return {
            __proto__: null,
            message: $.String(message.message),
        }
    } catch {
        return {
            __proto__: null,
            message: 'unknown error',
        }
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
    $Content.dispatchEvent(
        document,
        new $Content.CustomEvent(CustomEventId, {
            // @ts-expect-error null prototype
            __proto__: null,
            detail,
        }),
    )
}

export function isTwitter() {
    const url = new $.URL(window.location.href)
    return $.StringInclude($.URL_origin_getter(url), 'twitter.com')
}

export function noop() {}
Object.freeze(noop)
