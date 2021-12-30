import type { PublicKey } from '@solana/web3.js'
import type { ScopedStorage } from '@masknet/shared-base'

export const StorageDefaultValue = {
    publicKey: null as null | PublicKey,
}

let storage: ScopedStorage<typeof StorageDefaultValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
}

export function getStorage() {
    return storage.storage
}
