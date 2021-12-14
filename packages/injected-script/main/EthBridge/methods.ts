import { get } from 'lodash-unified'
import { apply } from '../intrinsic'
import { clone_into, handlePromise, sendEvent } from '../utils'

const hasListened: Record<string, boolean> = { __proto__: null! }
const { has } = Reflect
const { Promise, setTimeout, Boolean } = window
const { resolve } = Promise
const read = (path: string) => get(window, path)

export function ethBridgeSendRequest(path: string, id: number, request: unknown) {
    handlePromise(id, () => read(path).request(request))
}
export function ethBridgeIsConnected(path: string, id: number) {
    handlePromise(id, () => Boolean(read(path).isConnected()))
}
export function ethBridgePrimitiveAccess(path: string, id: number, property: string) {
    handlePromise(id, () => read(path)[property])
}
export function ethBridgeWatchEvent(path: string, event: string) {
    if (hasListened[event]) return
    hasListened[event] = true
    // Todo: wait until ethereum appears
    // Note: DO NOT use intrinsics here because ethereum is not.
    read(path).on(
        event,
        clone_into((...args: any[]) => {
            sendEvent('ethBridgeOnEvent', event, args)
        }),
    )
}

function untilEthereumOnlineInner(name: string) {
    if (has(window, name)) return apply<(result: true) => Promise<true>>(resolve, Promise, [true])
    return new Promise<true>((r) => {
        function check() {
            if (has(window, name)) return r(true)
            apply(setTimeout, window, [check, 200])
        }
        check()
    })
}
export function untilEthereumOnline(path: string, id: number) {
    handlePromise(id, untilEthereumOnlineInner.bind(null, path))
}
