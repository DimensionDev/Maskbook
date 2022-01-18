import type { ScopedStorage } from '@masknet/shared-base'

export const StorageDefaultValue = {
    currentPersona: null,
}

let storage: ScopedStorage<typeof StorageDefaultValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
}

export function getStorage() {
    return storage.storage
}
