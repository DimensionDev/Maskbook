import { $, $safe, $unsafe } from '../intrinsic.js'
import { handlePromise, sendEvent } from '../utils.js'
import type { InternalEvents } from '../../shared/index.js'

const hasListened: Record<string, boolean> = { __proto__: null! }
const __unsafe__window = $unsafe.unwrapXRayVision(window)

interface Ref extends NullPrototype {
    __unsafe__this: object
    __unsafe__value: unknown
}

function __unsafe__Get(path: string): Ref | undefined {
    const fragments = $.setPrototypeOf($.StringSplit(path, '.' as any), $safe.ArrayPrototype)
    let __unsafe__this: any = __unsafe__window
    let __unsafe__value: unknown = __unsafe__window

    for (const fragment of fragments) {
        if (__unsafe__this === undefined || __unsafe__this === null) return undefined

        try {
            if (fragment === '__metamask__') {
                __unsafe__value = __unsafe__window.ethereum?.providerMap?.get('MetaMask') || __unsafe__window.ethereum
                __unsafe__this = __unsafe__window
            } else {
                __unsafe__this = __unsafe__value
                __unsafe__value = __unsafe__this[fragment]
            }
        } catch {
            return undefined
        }
    }
    return { __unsafe__this, __unsafe__value, __proto__: null }
}

export function __unsafe__getValue(path: string, id: number, property: string) {
    handlePromise(id, () => {
        const ref = __unsafe__Get(path + '.' + property)
        if (!ref) return
        const { __unsafe__value } = ref

        // the public key cannot transfer correctly between pages, therefore stringify it manually
        if (path === 'solflare' && property === 'publicKey') {
            try {
                return (__unsafe__value as any).toBase58()
            } catch {}
        }

        return __unsafe__value
    })
}

export function __unsafe__call(path: string, id: number, ...args: unknown[]) {
    $.setPrototypeOf(args, $safe.ArrayPrototype)
    handlePromise(id, () => {
        const ref = __unsafe__Get(path)
        if (!ref) return
        const { __unsafe__this, __unsafe__value } = ref
        if (typeof __unsafe__value !== 'function') return
        return $.apply(__unsafe__value, __unsafe__this, $unsafe.structuredCloneFromSafe(args))
    })
}

export function __unsafe__callRequest(path: string, id: number, request: unknown) {
    __unsafe__call(path + '.request', id, $unsafe.structuredCloneFromSafe({ request }).request)
}

export function __unsafe__onEvent(path: string, bridgeEvent: keyof InternalEvents, event: string) {
    if (hasListened[`${path}_${event}`]) return
    hasListened[`${path}_${event}`] = true
    try {
        const ref = __unsafe__Get(path + '.on')
        if (!ref) return
        const { __unsafe__this, __unsafe__value } = ref
        if (typeof __unsafe__value !== 'function') return
        $.apply(__unsafe__value, __unsafe__this, [
            event,
            $unsafe.expose((...args: any[]) => {
                $.setPrototypeOf(args, null)
                sendEvent(bridgeEvent, path, event, args)
            }),
        ])
    } catch {}
}

function __unsafe__untilInner(name: string) {
    if ($.hasOwn(__unsafe__window, name)) return $.PromiseResolve(true)

    let restCheckTimes = 15 // 3s

    return new $.Promise<true>((resolve, reject) => {
        function check() {
            restCheckTimes -= 1
            if (restCheckTimes < 0) return reject(new Error('timeout'))
            if ($.hasOwn(__unsafe__window, name)) return resolve(true)
            $.setTimeout(check, 200)
        }
        check()
    })
}

export function __unsafe__until(path: string, id: number) {
    handlePromise(id, () => __unsafe__untilInner(path))
}
