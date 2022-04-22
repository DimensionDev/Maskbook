import type { ScopedStorage } from '@masknet/shared-base'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'

export const StorageDefaultValue = {
    domainAddressBook: {} as Web3Plugin.DomainAddressBook,
}

let storage: ScopedStorage<typeof StorageDefaultValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
}

export function getStorage() {
    return storage.storage
}
