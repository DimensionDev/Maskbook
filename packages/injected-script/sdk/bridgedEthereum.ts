import type { RequestArguments } from 'web3-core'
import type { EthereumProvider } from '../shared'
import { createPromise, sendEvent } from './utils'

/** Interact with the current ethereum provider */
export const bridgedEthereumProvider: EthereumProvider = {
    on(event, callback) {
        if (!bridgedEthereum.has(event)) {
            bridgedEthereum.set(event, new Set())
            sendEvent('ethBridgeRequestListen', event)
        }
        const map = bridgedEthereum.get(event)!
        map.add(callback)
        return () => void map.delete(callback)
    },
    off(event, callback) {
        const map = bridgedEthereum.get(event)
        if (map) map.delete(callback)
    },
    request<T extends unknown>(data: RequestArguments) {
        return createPromise<T>((id) => sendEvent('ethBridgeSendRequest', id, data))
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
