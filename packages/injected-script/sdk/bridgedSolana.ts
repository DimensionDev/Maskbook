import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { createPromise, sendEvent } from './utils'

function request(data: RequestArguments) {
    return createPromise((id) => sendEvent('solanaBridgeSendRequest', id, data))
}

function send(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void) {
    createPromise((id) =>
        sendEvent('solanaBridgeSendRequest', id, {
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
export const bridgedSolanaProvider: BridgedSolanaProvider = {
    request,
    send,
    sendAsync: send,
    on(event, callback) {
        if (!bridgedSolana.has(event)) {
            bridgedSolana.set(event, new Set())
            sendEvent('solanaBridgeRequestListen', event)
        }
        const map = bridgedSolana.get(event)!
        map.add(callback)
        return () => void map.delete(callback)
    },
    getProperty(key) {
        return createPromise((id) => sendEvent('solanaBridgePrimitiveAccess', id, key))
    },
    isConnected: isConnected,
    untilAvailable() {
        return createPromise((id) => sendEvent('untilSolanaBridgeOnline', id))
    },
}

async function watchConnectStatus() {
    const connected = await bridgedSolanaProvider.getProperty('isConnected')
    if (connected !== undefined) {
        isConnected = connected
    }
    bridgedSolanaProvider.on('connected', () => {
        isConnected = true
    })
    bridgedSolanaProvider.on('disconnect', () => {
        isConnected = false
    })
}
watchConnectStatus()

export interface BridgedSolanaProvider {
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
    getProperty(key: 'isPhantom' | 'isConnected'): Promise<boolean | undefined>
    /** Call window.solana.isConnected */
    isConnected: boolean
}
const bridgedSolana = new Map<string, Set<Function>>()
/** @internal */
export function onSolanaEvent(event: string, data: unknown[]) {
    for (const f of bridgedSolana.get(event) || []) {
        try {
            Reflect.apply(f, null, data)
        } catch {}
    }
    return
}
