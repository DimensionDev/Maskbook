import { apply } from '../intrinsic'
import { clone_into, handlePromise, sendEvent } from '../utils'
import type { InternalEvents } from '../../shared'

const hasListened: Record<string, boolean> = { __proto__: null! }
const { has } = Reflect
const { Promise, setTimeout } = window
const { resolve } = Promise
const { split } = String.prototype
const { shift } = Array.prototype

function read(path: string) {
    const fragments = apply(split, path, ['.' as any])
    let result: any = window
    while (fragments.length !== 0) {
        try {
            const key = apply(shift, fragments, [])
            result = key ? result[key] : result
        } catch {
            return
        }
    }
    return result
}

export function access(path: string, id: number, property: string) {
    handlePromise(id, () => {
        const item = read(path)[property]

        // the public key cannot transfer correctly between pages, since stringify it manually
        if (path === 'solflare' && property === 'publicKey') {
            return item.toBase58()
        }

        return item
    })
}

export function callRequest(path: string, id: number, request: unknown) {
    handlePromise(id, () => read(path).request(request))
}

export function execute(path: string, id: number, ...args: unknown[]) {
    handlePromise(id, () => read(path)(...args))
}

export function bindEvent(path: string, bridgeEvent: keyof InternalEvents, event: string) {
    if (hasListened[event]) return
    hasListened[event] = true
    read(path).on(
        event,
        clone_into((...args: any[]) => {
            // TODO: type unsound
            sendEvent(bridgeEvent, path, event, args)
        }),
    )
}

function untilInner(name: string) {
    if (has(window, name)) return apply<(result: true) => Promise<true>>(resolve, Promise, [true])

    let restCheckTimes = 150 // 30s

    return new Promise<true>((resolve) => {
        function check() {
            restCheckTimes -= 1
            if (restCheckTimes < 0) return
            if (has(window, name)) return resolve(true)
            apply(setTimeout, window, [check, 200])
        }
        check()
    })
}

export function until(path: string, id: number) {
    handlePromise(id, () => untilInner(path))
}
