import { createPromise, sendEvent } from './utils'

/** Interact with the current ethereum provider */
export const bridgedEthereumProvider: BridgedEthereumProvider = {
    request(data) {
        return createPromise((id) => sendEvent('ethBridgeSendRequest', id, data))
    },
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
    untilAvailable(): Promise<void>
    /** Send JSON RPC to the eth provider. */
    request(data: unknown): Promise<unknown>
    /** Add event listener */
    on(event: string, callback: (...args: any) => void): () => void
    /** Access primitive property on the window.ethereum object. */
    getProperty(key: 'isMetaMask'): Promise<boolean | undefined>
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
