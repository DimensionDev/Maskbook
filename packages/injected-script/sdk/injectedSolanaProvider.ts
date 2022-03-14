import type { RequestArguments } from 'web3-core'
import { createPromise, sendEvent } from './utils'

function request(data: RequestArguments) {
    return createPromise((id) => sendEvent('solanaBridgeSendRequest', id, data))
}

let isConnected = false

/** Interact with the current solana provider */
export const injectedSolanaProvider: InjectedSolanaProvider = {
    connect() {
        return createPromise((id) => sendEvent('solanaBridgeExecute', 'solana.connect', id))
    },
    request,
    on(event, callback) {
        if (!injectedSolana.has(event)) {
            injectedSolana.set(event, new Set())
            sendEvent('solanaBridgeRequestListen', event)
        }
        const map = injectedSolana.get(event)!
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
    const connected = await injectedSolanaProvider.getProperty('isConnected')
    if (connected !== undefined) {
        isConnected = connected
    }
    injectedSolanaProvider.on('connected', () => {
        isConnected = true
    })
    injectedSolanaProvider.on('disconnect', () => {
        isConnected = false
    })
}
watchConnectStatus()

export interface InjectedSolanaProvider {
    // _bn: result of serialization
    connect(): Promise<{ publicKey: { _bn: string } }>
    /** Wait for window.solana object appears. */
    untilAvailable(): Promise<true>
    /** Send JSON RPC to the solana provider. */
    request(data: RequestArguments): Promise<unknown>
    /** Add event listener */
    on(event: string, callback: (...args: any) => void): () => void
    /** Access primitive property on the window.solana object. */
    getProperty(key: 'isPhantom' | 'isConnected'): Promise<boolean | undefined>
    /** Call window.solana.isConnected */
    isConnected: boolean
}
const injectedSolana = new Map<string, Set<Function>>()
/** @internal */
export function onSolanaEvent(event: string, data: unknown[]) {
    for (const f of injectedSolana.get(event) || []) {
        try {
            Reflect.apply(f, null, data)
        } catch {}
    }
    return
}
