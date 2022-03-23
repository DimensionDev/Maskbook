import type { ScopedStorage } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-solana'

export const StorageDefaultValue = {
    publicKey: null as null | string,
    chainId: null as null | ChainId,
}

let storage: ScopedStorage<typeof StorageDefaultValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
}

export function getStorage() {
    return storage.storage
}
