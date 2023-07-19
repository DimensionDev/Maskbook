import { indexedDBStorageBackend, inMemoryStorageBackend } from './storage.js'

export async function memoryWrite(key: string, value: unknown) {
    return inMemoryStorageBackend.setValue(key, value)
}
export async function memoryRead(key: string) {
    return inMemoryStorageBackend.getValue(key)
}
export async function indexedDBWrite(key: string, value: unknown) {
    return indexedDBStorageBackend.setValue(key, value)
}
export async function indexedDBRead(key: string) {
    return indexedDBStorageBackend.getValue(key)
}
