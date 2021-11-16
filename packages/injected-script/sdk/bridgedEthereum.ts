import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
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
export const bridgedEthereumProvider: BridgedEthereumProvider = {
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
    _metamaskIsUnlocked() {
        return createPromise((id) => sendEvent('ethBridgeMetaMaskIsUnlocked', id))
    },
    isConnected() {
        return createPromise((id) => sendEvent('ethBridgeIsConnected', id))
    },
    untilAvailable() {
        return createPromise((id) => sendEvent('untilEthBridgeOnline', id))
    },
}
export interface BridgedEthereumProvider {
    /** Wait for window.ethereum object appears. */
    untilAvailable(): Promise<true>
    /** Send JSON RPC to the eth provider. */
    request(data: RequestArguments): Promise<unknown>
    /** Send JSON RPC  */
    send(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    /** Async send JSON RPC  */
    sendAsync(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    /** Add event listener */
    on(event: string, callback: (...args: any) => void): () => void
    /** Access primitive property on the window.ethereum object. */
    getProperty(key: 'isMetaMask' | 'isCoin98' | 'isMathWallet' | 'isWalletLink'): Promise<boolean | undefined>
    /** MetaMask only, experimental API. */
    _metamaskIsUnlocked(): Promise<boolean>
    /** Call window.ethereum.isConnected() */
    isConnected(): Promise<boolean>
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
