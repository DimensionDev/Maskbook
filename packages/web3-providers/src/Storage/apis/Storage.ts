import { KVStorage } from '../storages/KV.js'

export class Web3Storage {
    static createKVStorage(namespace: string) {
        return new KVStorage(namespace)
    }
}
