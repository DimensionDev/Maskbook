import { KVStorage } from '../storages/KV.js'

export const Web3Storage = {
    createKVStorage(namespace: string) {
        return new KVStorage(namespace)
    },
}
