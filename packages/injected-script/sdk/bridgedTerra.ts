import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { createPromise, sendEvent } from './utils'

function request(data: RequestArguments) {
    return createPromise((id) => sendEvent('terraBridgeSendRequest', id, data))
}

function send(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void) {
    createPromise((id) =>
        sendEvent('terraBridgeSendRequest', id, {
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

let isConnected = false
/** Interact with the current solana provider */
export const bridgedTerraProvider: BridgedSolanaProvider = {
    connect() {
        return createPromise((id) => sendEvent('terraBridgeExecute', 'terra.connect', id))
    },
    request,
    send,
    sendAsync: send,
    on(event, callback) {
        if (!bridgedTerra.has(event)) {
            bridgedTerra.set(event, new Set())
            sendEvent('terraBridgeRequestListen', event)
        }
        const map = bridgedTerra.get(event)!
        map.add(callback)
        return () => void map.delete(callback)
    },
    getProperty(key) {
        return createPromise((id) => sendEvent('terraBridgePrimitiveAccess', id, key))
    },
    isConnected: isConnected,
    untilAvailable() {
        return createPromise((id) => sendEvent('untilTerraBridgeOnline', id))
    },
}

async function watchConnectStatus() {
    const connected = await bridgedTerraProvider.getProperty('isConnected')
    if (connected !== undefined) {
        isConnected = connected
    }
    bridgedTerraProvider.on('connected', () => {
        isConnected = true
    })
    bridgedTerraProvider.on('disconnect', () => {
        isConnected = false
    })
}
watchConnectStatus()

export interface BridgedSolanaProvider {
    // _bn: result of serialization
    connect(): Promise<{ publicKey: { _bn: string } }>
    /** Wait for window.solana object appears. */
    untilAvailable(): Promise<true>
    /** Send JSON RPC to the solana provider. */
    request(data: RequestArguments): Promise<unknown>
    /** Send JSON RPC  */
    send(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    /** Async send JSON RPC  */
    sendAsync(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    /** Add event listener */
    on(event: string, callback: (...args: any) => void): () => void
    /** Access primitive property on the window.solana object. */
    getProperty(key: 'isTerraStation' | 'isConnected'): Promise<boolean | undefined>
    /** Call window.solana.isConnected */
    isConnected: boolean
}
const bridgedTerra = new Map<string, Set<Function>>()
/** @internal */
export function onTerraEvent(event: string, data: unknown[]) {
    for (const f of bridgedTerra.get(event) || []) {
        try {
            Reflect.apply(f, null, data)
        } catch {}
    }
    return
}
