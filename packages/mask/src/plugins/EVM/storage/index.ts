import type { ScopedStorage } from '@masknet/shared-base'
import type { Web3Plugin } from '@masknet/plugin-infra'

export const StorageDefaultValue = {
    ensAddressBook: {} as Web3Plugin.EnsAddressBook,
}

let storage: ScopedStorage<typeof StorageDefaultValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
}

export function getStorage() {
    return storage.storage
}
