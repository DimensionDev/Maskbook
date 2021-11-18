import type { User } from '@onflow/fcl'
import type { ScopedStorage } from '@masknet/shared-base'

export const StorageDefaultValue: {
    user: User | null
} = {
    user: null,
}

let storage: ScopedStorage<typeof StorageDefaultValue> = null!

export function getStorage() {
    return storage.storage
}

export function setupStorage(_: typeof storage) {
    storage = _
}
