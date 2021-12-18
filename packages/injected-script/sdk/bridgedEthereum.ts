import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { EthereumProvider } from '../shared'
import { createPromise, sendEvent } from './utils'

function request(data: RequestArguments) {
    return createPromise((id) => sendEvent('ethBridgeSendRequest', id, data))
}

function send(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void) {
    createPromise((id) =>
        sendEvent('ethBridgeSendRequest', id, {
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
export const bridgedEthereumProvider: EthereumProvider = {
    request,
    send,
    sendAsync: send,
    on(event, callback) {
        if (!bridgedEthereum.has(event)) {
            bridgedEthereum.set(event, new Set())
            sendEvent('ethBridgeRequestListen', event)
        }
        const map = bridgedEthereum.get(event)!
        map.add(callback)
        return () => void map.delete(callback)
    },
    getProperty(key) {
        return createPromise((id) => sendEvent('ethBridgePrimitiveAccess', id, key))
    },
    untilAvailable() {
        return createPromise((id) => sendEvent('untilEthBridgeOnline', id))
    },
}

const bridgedEthereum = new Map<string, Set<Function>>()
/** @internal */
export function onEthEvent(event: string, data: unknown[]) {
    for (const f of bridgedEthereum.get(event) || []) {
        try {
            Reflect.apply(f, null, data)
        } catch {}
    }
    return
}
