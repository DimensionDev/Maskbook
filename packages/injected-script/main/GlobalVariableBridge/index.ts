import { $, $Blessed, $Content } from '../intrinsic.js'
import { handlePromise, sendEvent } from '../utils.js'
import type { InternalEvents } from '../../shared/index.js'

const hasListened: Record<string, boolean> = { __proto__: null! }
const __content__window = $.unwrapXRayVision(window)

function read(path: string): unknown {
    const fragments = $.StringSplit(path, '.' as any)
    let __content__result: any = __content__window
    while (fragments.length !== 0) {
        try {
            const key: string = $.ArrayShift(fragments)
            __content__result = key ? __content__result[key] : __content__result
        } catch {
            return
        }
    }
    return __content__result
}

export function __content__access(path: string, id: number, property: string) {
    handlePromise(id, () => {
        const item = read(path + '.' + property)

        // the public key cannot transfer correctly between pages, therefore stringify it manually
        if (path === 'solflare' && property === 'publicKey') {
            try {
                return (item as any).toBase58()
            } catch {}
        }

        return item
    })
}

export function __content__callRequest(path: string, id: number, request: unknown) {
    handlePromise(id, () => (read(path) as any)?.request($.cloneIntoContentAny(request)))
}

export function __content__call(path: string, id: number, ...args: unknown[]) {
    handlePromise(id, () => (read(path) as any)?.(...$.cloneIntoContent(args)))
}

export function __content__onEvent(path: string, bridgeEvent: keyof InternalEvents, event: string) {
    if (hasListened[`${path}_${event}`]) return
    hasListened[`${path}_${event}`] = true
    try {
        ;(read(path) as any)?.on(
            event,
            $.cloneIntoContent((...args: any[]) => {
                $.setPrototypeOf(args, $Blessed.ArrayPrototype)
                sendEvent(bridgeEvent, path, event, args)
            }),
        )
    } catch {}
}

function untilInner(name: string) {
    if ($.hasOwn(__content__window, name)) return $.PromiseResolve(true)

    let restCheckTimes = 150 // 30s

    return new $.Promise<true>((resolve) => {
        function check() {
            restCheckTimes -= 1
            if (restCheckTimes < 0) return
            if ($.hasOwn(__content__window, name)) return resolve(true)
            $Content.setTimeout(check, 200)
        }
        check()
    })
}

export function __content__until(path: string, id: number) {
    handlePromise(id, () => untilInner(path))
}
