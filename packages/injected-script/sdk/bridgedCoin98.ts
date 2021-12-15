import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { EthereumProvider } from '../shared'
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
export const bridgedCoin98Provider: EthereumProvider = {
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
    untilAvailable() {
        return createPromise((id) => sendEvent('untilCoin98BridgeOnline', id))
    },
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
