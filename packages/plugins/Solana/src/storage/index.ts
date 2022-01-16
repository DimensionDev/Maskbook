import type { ScopedStorage } from '@masknet/shared-base'

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
