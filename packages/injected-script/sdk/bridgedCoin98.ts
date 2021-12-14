import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { createPromise, sendEvent } from './utils'

function request(data: RequestArguments) {
    return createPromise((id) => sendEvent('coin98BridgeSendRequest', id, data))
}

function send(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void) {
    createPromise((id) =>
        sendEvent('coin98BridgeSendRequest', id, {
            method: payload.method,
            params: payload.params,
        }),
    ).then(
        (value) => {
            callback(null, {
                jsonrpc: '2.0',
                id: payload.id as number,
                result: value,
            })
        },
        (error) => {
            if (error instanceof Error) callback(error)
        },
    )
}

/** Interact with the current ethereum provider */
export const bridgedCoin98Provider: BridgedCoin98Provider = {
    request,
    send,
    sendAsync: send,
    on(event, callback) {
        if (!bridgedCoin98.has(event)) {
            bridgedCoin98.set(event, new Set())
            sendEvent('coin98BridgeRequestListen', event)
        }
        const map = bridgedCoin98.get(event)!
        map.add(callback)
        return () => void map.delete(callback)
    },
    getProperty(key) {
        return createPromise((id) => sendEvent('coin98BridgePrimitiveAccess', id, key))
    },
    isConnected() {
        return createPromise((id) => sendEvent('coin98BridgeIsConnected', id))
    },
    untilAvailable() {
        return createPromise((id) => sendEvent('untilCoin98BridgeOnline', id))
    },
}
export interface BridgedCoin98Provider {
    /** Wait for window.coin98 object appears. */
    untilAvailable(): Promise<true>
    /** Send JSON RPC to the coin98 provider. */
    request(data: RequestArguments): Promise<unknown>
    /** Send JSON RPC  */
    send(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    /** Async send JSON RPC  */
    sendAsync(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    /** Add event listener */
    on(event: string, callback: (...args: any) => void): () => void
    /** Access primitive property on the window.coin98 object. */
    getProperty(key: 'isCoin98'): Promise<boolean | undefined>
    /** Call window.coin98.provider.isConnected() */
    isConnected(): Promise<boolean>
}
const bridgedCoin98 = new Map<string, Set<Function>>()
/** @internal */
export function onCoin98Event(event: string, data: unknown[]) {
    for (const f of bridgedCoin98.get(event) || []) {
        try {
            Reflect.apply(f, null, data)
        } catch {}
    }
    return
}
