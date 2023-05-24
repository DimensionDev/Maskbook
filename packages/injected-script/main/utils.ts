import { CustomEventId, encodeEvent, type InternalEvents } from '../shared/index.js'
import { $unsafe, $, $safe } from './intrinsic.js'

/** @deprecated */
export function defineFunctionOnContentObject<T extends object>(
    contentObject: T,
    key: keyof T,
    apply: (target: any, thisArg: any, argArray?: any) => any,
) {
    if ($.isFirefox) {
        const rawObject = $unsafe.unwrapXRayVision(contentObject)
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
    const __unsafe__targetPrototype = $unsafe.unwrapXRayVision(targetPrototype)
    const targetDescriptor = $.getOwnPropertyDescriptors(targetPrototype)
    for (const key in patchedProps) {
        if (key === 'constructor') continue
        const desc = patchedProps[key]
        const oldDesc = { ...targetDescriptor[key] }
        if (!oldDesc.configurable) continue
        desc.configurable = true
        desc.enumerable = oldDesc.enumerable
        if ('writable' in oldDesc) desc.writable = oldDesc.writable
        if ($.hasOwn(desc, 'value') && desc.value) desc.value = $unsafe.expose(desc.value, oldDesc.value)
        if ($.hasOwn(desc, 'get') && desc.get) desc.get = $unsafe.expose(desc.get!, oldDesc.get!)
        if ($.hasOwn(desc, 'set') && desc.set) desc.set = $unsafe.expose(desc.set!, oldDesc.set!)
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
    const binary = $.Uint8Array_from(xray_fileContent)
    const blob = new $.Blob($safe.Array_of(binary), {
        __proto__: null,
        type: format,
    })
    const file = new $.File($safe.Array_of(blob), fileName, {
        __proto__: null,
        lastModified: $.DateNow(),
        type: format,
    })
    return $unsafe.structuredCloneFromSafe(file)
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
        new $.CustomEvent(CustomEventId, {
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
