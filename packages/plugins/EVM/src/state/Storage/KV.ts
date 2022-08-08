import type { Storage } from '@masknet/web3-shared-base'
import { KeyValue, StorageAPI } from '@masknet/web3-providers'

export class KVStorage extends Storage {
    private kv: StorageAPI.Storage<unknown> | null = null

    constructor(private namespace: string) {
        super()
    }
    private getKV<T>() {
        if (this.kv) return this.kv
        this.kv = KeyValue.createJSON_Storage<T>(this.namespace)
        return this.kv
    }

    async get<T>(key: string) {
        return this.getKV<T>().get(key)
    }

    async set<T>(key: string, value: T) {
        return this.getKV<T>().set(key, value)
    }
}
