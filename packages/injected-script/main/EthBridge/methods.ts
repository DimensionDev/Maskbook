import { apply } from '../intrinsic'
import { clone_into, handlePromise, sendEvent } from '../utils'

const hasListened: Record<string, boolean> = { __proto__: null! }
const { has } = Reflect
const { Promise, setTimeout, Boolean } = window
const { resolve } = Promise

export function ethBridgeSendRequest(id: number, request: unknown) {
    handlePromise(id, () => window.ethereum!.request(request))
}
export function ethBridgeIsConnected(id: number) {
    handlePromise(id, () => Boolean(window.ethereum!.isConnected()))
}
export function ethBridgeMetaMaskIsUnlocked(id: number) {
    handlePromise(id, async () => {
        return Boolean(await window.ethereum!._metamask!.isUnlocked!())
    })
}
export function ethBridgePrimitiveAccess(id: number, property: string) {
    handlePromise(id, () => (window.ethereum! as any)[property])
}
export function ethBridgeWatchEvent(event: string) {
    if (hasListened[event]) return
    hasListened[event] = true
    // Todo: wait until ethereum appears
    // Note: DO NOT use intrinsics here because ethereum is not.
    window.ethereum?.on(
        event,
        clone_into((...args) => {
            sendEvent('ethBridgeOnEvent', event, args)
        }),
    )
}

function untilEthereumOnlineInner() {
    if (has(window, 'ethereum')) return apply<(result: true) => Promise<true>>(resolve, Promise, [true])
    return new Promise<true>((r) => {
        function check() {
            if (has(window, 'ethereum')) return r(true)
            apply(setTimeout, window, [check, 200])
        }
        check()
    })
}
export function untilEthereumOnline(id: number) {
    handlePromise(id, untilEthereumOnlineInner)
}
