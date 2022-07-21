import { CustomEventId, encodeEvent, InternalEvents } from '../shared/index.js'
import { $Content, $ } from './intrinsic.js'

export const cloneIntoContent = <T>(obj: T) => {
    if (typeof obj === 'function') {
        if ($.exportFunction) return $.exportFunction(obj, $Content.window)
        return obj
    } else {
        if ($.cloneInto) return $.cloneInto(obj, $Content.window)
        return obj
    }
}

export function defineFunctionOnContentObject<T extends object>(
    contentObject: T,
    key: keyof T,
    apply: (target: any, thisArg: any, argArray?: any) => any,
) {
    // Firefox magics!
    if ($.XPCNativeWrapper) {
        const rawObject = $.XPCNativeWrapper.unwrap(contentObject)
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
    contentObject[key] = new $Content.Proxy(contentObject[key], { apply })
}

export function unwrapXRayVision<T>(x: T) {
    return $.XPCNativeWrapper?.unwrap(x) ?? x
}

export function contentFileFromBufferSource(format: string, fileName: string, xray_fileContent: number[] | Uint8Array) {
    const binary = unwrapXRayVision(Uint8Array.from(xray_fileContent))
    const blob = new $Content.Blob([binary], { type: format })
    const file = new $Content.File([blob], fileName, {
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
    $Content.dispatchEvent(document, new $Content.CustomEvent(CustomEventId, { detail }))
}

export function isTwitter() {
    const url = new $.URL(window.location.href)
    return $.StringInclude($.URL_origin_getter(url), 'twitter.com')
}
