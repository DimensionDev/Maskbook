import { EthereumAddress } from 'wallet.ts'
import { getTransactionCount } from './network'

class NonceManager {
    constructor(private address: string) {}
    private nonce = NonceManager.INITIAL_NONCE
    private locked: boolean = false
    private tasks: (() => void)[] = []

    private lock() {
        this.locked = true
    }
    private unlock() {
        this.locked = false
    }
    private contine() {
        if (!this.locked) this.tasks.shift()?.()
    }
    private async getRemoteNonce() {
        return new Promise<number>(async (resolve, reject) => {
            const callback = (e: Error | null, nonce?: number) => {
                if (e) reject(e)
                // TODO: is 0 a correct value if nonce is undefined?
                else resolve(nonce ?? 0)
                this.unlock()
                this.contine()
            }
            const run = async () => {
                try {
                    this.lock()
                    callback(null, await getTransactionCount(this.address))
                } catch (e) {
                    callback(e)
                }
            }
            if (this.locked) this.tasks.push(run)
            else run()
        })
    }
    private async setLocalNonce(nonce: number) {
        return new Promise<void>(async (resolve, reject) => {
            const callback = (e: Error | null) => {
                if (e) reject(e)
                else resolve()
                this.unlock()
                this.contine()
            }
            const run = async () => {
                this.lock()
                this.nonce = nonce
                callback(null)
            }
            if (this.locked) this.tasks.push(run)
            else run()
        })
    }

    public async getNonce() {
        const nonce = this.nonce === NonceManager.INITIAL_NONCE ? await this.getRemoteNonce() : this.nonce
        await this.setLocalNonce(nonce)
        return nonce
    }
    public async setNonce(nonce: number) {
        await this.setLocalNonce(nonce)
    }
    public async resetNonce() {
        const nonce = await this.getRemoteNonce()
        await this.setLocalNonce(nonce)
    }

    static INITIAL_NONCE = -1
}

const cache = new Map<string, NonceManager>()

/**
 * Get current available nonce, call commitNonce() after the transaction succeed
 * @param address the account address
 */
export function getNonce(address_: string) {
    const address = EthereumAddress.checksumAddress(address_)
    if (!cache.has(address)) cache.set(address, new NonceManager(address))
    return cache.get(address)!.getNonce()
}

/**
 * Commit to a new nonce only call when transaction succeed
 * @param address the account address
 */
export async function commitNonce(address_: string) {
    const address = EthereumAddress.checksumAddress(address_)
    if (!cache.has(address)) cache.set(address, new NonceManager(address))
    return setNonce(address, (await cache.get(address)!.getNonce()) + 1)
}

/**
 * Set a new nonce regardless the old one
 * @param address the account address
 * @param nonce the new nonce
 */
export function setNonce(address_: string, nonce: number) {
    const address = EthereumAddress.checksumAddress(address_)
    if (!cache.has(address)) cache.set(address, new NonceManager(address))
    return cache.get(address)!.setNonce(nonce)
}

/**
 * Sync local nonce to remote one (depend on your current node)
 * @param address the account address
 */
export function resetNonce(address_: string) {
    const address = EthereumAddress.checksumAddress(address_)
    if (!cache.has(address)) cache.set(address, new NonceManager(address))
    return cache.get(address)!.resetNonce()
}

/**
 * Sync all nonces
 */
export async function resetAllNonce() {
    await Promise.all(Array.from(cache.values()).map((m) => m.resetNonce()))
}
