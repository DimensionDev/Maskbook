import type { ScopedStorage } from '@masknet/shared-base'
import type { Web3Plugin } from '@masknet/plugin-infra'

export const StorageDefaultValue = {
    domainAddressBook: {} as Web3Plugin.domainAddressBook,
}

let storage: ScopedStorage<typeof StorageDefaultValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
}

export function getStorage() {
    return storage.storage
}
