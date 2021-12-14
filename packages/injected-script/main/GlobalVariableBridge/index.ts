import { apply } from '../intrinsic'
import { clone_into, handlePromise, sendEvent } from '../utils'
import type { InternalEvents } from '../../shared'

const hasListened: Record<string, boolean> = { __proto__: null! }
const { has } = Reflect
const { Promise, setTimeout } = window
const { resolve } = Promise

const read = (path: string) => {
    const fragments = path.split('.')
    let result = window as any
    while (true) {
        if (fragments.length === 0) return result
        const key = fragments.shift()
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
    // Todo: wait until ethereum appears
    // Note: DO NOT use intrinsics here because ethereum is not.
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
    handlePromise(id, untilInner.bind(null, path))
}
