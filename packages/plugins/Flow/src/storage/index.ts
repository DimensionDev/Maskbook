import type { User } from '@onflow/fcl'
import type { ScopedStorage } from '@masknet/shared-base'

export const StorageDefaultValue = {
    user: null as User | null,
}

let storage: ScopedStorage<typeof StorageDefaultValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
}

export function getStorage() {
    return storage.storage
}
