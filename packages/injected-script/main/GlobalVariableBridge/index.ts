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
    while (true) {
        if (fragments.length === 0) return result
        const key = apply(shift, fragments, [])
        result = key ? result[key] : result
    }
}

export function access(path: string, id: number, property: string) {
    handlePromise(id, () => read(path)[property])
}

export function callRequest(path: string, id: number, request: unknown) {
    handlePromise(id, () => read(path).request(request))
}

export function bindEvent(path: string, bridgeEvent: keyof InternalEvents, event: string) {
    if (hasListened[event]) return
    hasListened[event] = true
    read(path).on(
        event,
        clone_into((...args: any[]) => {
            sendEvent(bridgeEvent, event, args)
        }),
    )
}

function untilInner(name: string) {
    if (has(window, name)) return apply<(result: true) => Promise<true>>(resolve, Promise, [true])
    return new Promise<true>((r) => {
        function check() {
            if (has(window, name)) return r(true)
            apply(setTimeout, window, [check, 200])
        }
        check()
    })
}

export function until(path: string, id: number) {
    handlePromise(id, () => untilInner(path))
}
