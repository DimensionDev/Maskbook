import { KVStorage } from '../storages/KV.js'
import * as RSS3Storage from /* webpackDefer: true */ '../storages/RSS3.js'
import * as FireflyStorage from /* webpackDefer: true */ '../storages/Firefly.js'

export class Web3Storage {
    static createKVStorage(namespace: string) {
        return new KVStorage(namespace)
    }

    static createFireflyStorage(namespace: string, address: string) {
        return new FireflyStorage.FireflyStorage(namespace, address)
    }

    static createRSS3Storage(namespace: string) {
        return new RSS3Storage.RSS3Storage(namespace)
    }
}
