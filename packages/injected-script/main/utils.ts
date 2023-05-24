import { CustomEventId, encodeEvent, type InternalEvents } from '../shared/index.js'
import { $Content, $, $Blessed } from './intrinsic.js'
import { exportFunction, isFirefox, unwrapXRayVision } from './intrinsic_content.js'

export function defineFunctionOnContentObject<T extends object>(
    contentObject: T,
    key: keyof T,
    apply: (target: any, thisArg: any, argArray?: any) => any,
) {
    // Firefox magics!
    if (isFirefox) {
        const rawObject = unwrapXRayVision(contentObject)
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
        __proto__: null,
        apply,
    })
}

export function contentFileFromBufferSource(format: string, fileName: string, xray_fileContent: number[] | Uint8Array) {
    const binary = unwrapXRayVision(Uint8Array.from(xray_fileContent))
    const blob = new $Content.Blob($Blessed.Array_from(binary), {
        __proto__: null,
        type: format,
    })
    const file = new $Content.File($Blessed.Array_from(blob), fileName, {
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
