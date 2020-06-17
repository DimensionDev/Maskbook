import number from 'bignumber.js'
import { web3 } from './web3'

class NonceManager {
    constructor(private address: string) {}
    private nonce = NonceManager.INITIAL_NONCE
    private getNonceFromNode() {
        return web3.eth.getTransactionCount(this.address)
    }

    public async getNonce() {
        this.nonce = this.nonce === NonceManager.INITIAL_NONCE ? await this.getNonceFromNode() : this.nonce + 1
        return this.nonce
    }

    public setNonce(nonce: number) {
        this.nonce = nonce
    }

    public async resetNonce() {
        this.nonce = await this.getNonceFromNode()
    }

    static INITIAL_NONCE = -1
}

const cache = new Map<string, NonceManager>()

export function getNonce(address: string) {
    if (!cache.has(address)) {
        cache.set(address, new NonceManager(address))
    }
    return cache.get(address)!.getNonce()
}

export function setNonce(address: string, nonce: number) {
    if (!cache.has(address)) {
        cache.set(address, new NonceManager(address))
    }
    cache.get(address)?.setNonce(nonce)
}

export async function resetNonce(address: string) {
    await cache.get(address)?.resetNonce()
}

export function resetAllNonce() {
    return Promise.all(Array.from(cache.values()).map((m) => m.resetNonce()))
}
