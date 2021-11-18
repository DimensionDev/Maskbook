import type { User } from '@onflow/fcl'
import type { ScopedStorage } from '@masknet/shared-base'

export const StorageDefaultValue: {
    user: User | null
} = {
    user: null,
}

export let storage: ScopedStorage<typeof StorageDefaultValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
}
