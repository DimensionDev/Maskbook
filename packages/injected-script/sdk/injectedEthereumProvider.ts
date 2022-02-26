import type { RequestArguments } from 'web3-core'
import type { EthereumProvider } from '../shared'
import { createPromise, sendEvent } from './utils'

/** Interact with the currently injected ethereum provider */
export const injectedEthereumProvider: EthereumProvider = {
    on(event, callback) {
        if (!injectedEthereum.has(event)) {
            injectedEthereum.set(event, new Set())
            sendEvent('ethBridgeRequestListen', event)
        }
        const map = injectedEthereum.get(event)!
        map.add(callback)
        return () => void map.delete(callback)
    },
    off(event, callback) {
        const map = injectedEthereum.get(event)
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

const injectedEthereum = new Map<string, Set<Function>>()

/** @internal */
export function onEthEvent(event: string, data: unknown[]) {
    for (const f of injectedEthereum.get(event) || []) {
        try {
            Reflect.apply(f, null, data)
        } catch {}
    }
    return
}
