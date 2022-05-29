import { DataProvider } from '@masknet/public-api'
import type { ScopedStorage } from '@masknet/shared-base'

interface StorageValue {
    dataProvider: DataProvider
}

export const storageDefaultValue = {
    dataProvider: DataProvider.COIN_GECKO,
}

let storage: ScopedStorage<StorageValue> = null!

export function setupStorage(_: typeof storage) {
    storage = _
}

export function getStorage() {
    return storage.storage
}

export function setStorage(dataProvider: DataProvider) {
    storage.storage.dataProvider.setValue(dataProvider)
}

export function getDataProvider() {
    return storage.storage.dataProvider
}
