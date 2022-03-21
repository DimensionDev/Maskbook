import type { ScopedStorage } from '@masknet/shared-base'
import { hexToBase58 } from '../utils'

export const StorageDefaultValue = {
    publicKey: null as null | string,
    network: null as null | number,
}

let storage: ScopedStorage<typeof StorageDefaultValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
}

export function getStorage() {
    return storage.storage
}

type BNLike = {
    _bn: string
}
export async function storeConnection(pubKey: string | BNLike, chainId?: number) {
    const base58Key = typeof pubKey === 'string' ? pubKey : hexToBase58(pubKey._bn)
    const storage = getStorage()
    await storage.publicKey.setValue(base58Key)
    if (chainId) {
        await storage.network.setValue(chainId)
    }
}
