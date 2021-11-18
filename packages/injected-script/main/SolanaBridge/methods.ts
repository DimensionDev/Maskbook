import { apply } from '../intrinsic'
import { clone_into, handlePromise, sendEvent } from '../utils'

const hasListened: Record<string, boolean> = { __proto__: null! }
const { has } = Reflect
const { Promise, setTimeout, Boolean } = window
const { resolve } = Promise

export function solanaBridgeSendRequest(id: number, request: unknown) {
    handlePromise(id, () => window.solana!.request(request))
}
export function solanaBridgeIsConnected(id: number) {
    handlePromise(id, () => Boolean(window.solana!.isConnected))
}
export function solanaBridgePrimitiveAccess(id: number, property: string) {
    handlePromise(id, () => (window.solana! as any)[property])
}
export function solanaBridgeWatchEvent(event: string) {
    if (hasListened[event]) return
    hasListened[event] = true
    // Todo: wait until solana appears
    // Note: DO NOT use intrinsics here because solana is not.
    window.solana?.on(
        event,
        clone_into((...args) => {
            sendEvent('solanaBridgeOnEvent', event, args)
        }),
    )
}

function untilSolanaOnlineInner() {
    if (has(window, 'solana')) return apply<(result: true) => Promise<true>>(resolve, Promise, [true])
    return new Promise<true>((r) => {
        function check() {
            if (has(window, 'solana')) return r(true)
            apply(setTimeout, window, [check, 200])
        }
        check()
    })
}
export function untilSolanaOnline(id: number) {
    handlePromise(id, untilSolanaOnlineInner)
}
