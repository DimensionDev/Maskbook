import { DataProvider } from '@masknet/public-api'
import type { ScopedStorage } from '@masknet/shared-base'

interface StorageValue {
    sourceProvider: DataProvider
}

export const storageDefaultValue = {
    sourceProvider: DataProvider.CoinGecko,
}

let storage: ScopedStorage<StorageValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
}

export function getStorage() {
    return storage.storage
}

export function setStorage(sourceProvider: DataProvider) {
    storage.storage.sourceProvider.setValue(sourceProvider)
}

export function getDataProvider() {
    return storage.storage.sourceProvider
}
