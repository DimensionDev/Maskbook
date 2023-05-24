import { CustomEventId, encodeEvent, type InternalEvents } from '../shared/index.js'
import { $unsafe, $, $safe } from './intrinsic.js'
import { exportFunction, getOwnPropertyDescriptors, isFirefox, unwrapXRayVision } from './intrinsic_content.js'

/** @deprecated */
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
    contentObject[key] = new $unsafe.Proxy(contentObject[key], {
        __proto__: null,
        apply,
    })
}

export function PatchDescriptor(patchedProps: PropertyDescriptorMap & NullPrototype, targetPrototype: object) {
    const __unsafe__targetPrototype = $.unwrapXRayVision(targetPrototype)
    const targetDescriptor = getOwnPropertyDescriptors(targetPrototype)
    for (const key in patchedProps) {
        if (key === 'constructor') continue
        const desc = patchedProps[key]
        const oldDesc = { ...targetDescriptor[key] }
        if (!oldDesc.configurable) continue
        desc.configurable = true
        desc.enumerable = oldDesc.enumerable
        if ('writable' in oldDesc) desc.writable = oldDesc.writable
        if ($.hasOwn(desc, 'value') && desc.value) desc.value = $unsafe.expose(desc.value)
        if ($.hasOwn(desc, 'get') && desc.get) desc.get = $unsafe.expose(desc.get!)
        if ($.hasOwn(desc, 'set') && desc.set) desc.set = $unsafe.expose(desc.set!)
        try {
            $.defineProperty(__unsafe__targetPrototype, key, desc)
        } catch {}
    }
}

export function PatchDescriptor_NonNull(patchedProps: PropertyDescriptorMap, targetPrototype: object) {
    $.setPrototypeOf(patchedProps, null)
    PatchDescriptor(patchedProps as PropertyDescriptorMap & NullPrototype, targetPrototype)
}

export function contentFileFromBufferSource(format: string, fileName: string, xray_fileContent: number[] | Uint8Array) {
    const binary = unwrapXRayVision($.Uint8Array_from(xray_fileContent))
    const blob = new $unsafe.Blob($safe.Array_from(binary), {
        __proto__: null,
        type: format,
    })
    const file = new $unsafe.File($safe.Array_from(blob), fileName, {
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
export async function handlePromise(id: number, f: () => any) {
    try {
        const data = await $.setPrototypeOf($.PromiseResolve(f()), $safe.PromisePrototype)
        sendEvent('resolvePromise', id, data)
    } catch (error) {
        sendEvent('rejectPromise', id, getError(error))
    }
}

export function sendEvent<T extends keyof InternalEvents>(event: T, ...args: InternalEvents[T]) {
    $.setPrototypeOf(args, null)
    const detail = encodeEvent(event, args)
    $.dispatchEvent(
        document,
        new $unsafe.CustomEvent(CustomEventId, {
            __proto__: null,
            detail,
        }),
    )
}

export function isTwitter() {
    const url = new $.URL(window.location.href)
    return $.StringInclude($.URL_origin(url), 'twitter.com')
}

export function noop() {}
Object.freeze(noop)
