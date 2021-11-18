import type { User } from '@onflow/fcl'
import type { ScopedStorage } from '@masknet/shared-base'

export const StorageDefaultValue = {
    user: null as User | null,
}

export let storage: ScopedStorage<typeof StorageDefaultValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
}
