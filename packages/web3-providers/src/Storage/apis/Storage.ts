import type { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { KVStorage } from '../storages/KV.js'
import { NextIDStorage } from '../storages/NextID.js'
import { RSS3Storage } from '../storages/RSS3.js'
import { FireflyStorage } from '../storages/Firefly.js'
import { SharedContextRef } from '../../PluginContext/index.js'

class Web3StorageAPI {
    createKVStorage(namespace: string) {
        return new KVStorage(namespace)
    }

    createFireflyStorage(namespace: string, address: string) {
        return new FireflyStorage(namespace, address || '')
    }

    createRSS3Storage(namespace: string) {
        return new RSS3Storage(namespace)
    }

    createNextIDStorage(proofIdentity: string, platform: NextIDPlatform, signerOrPublicKey: string | ECKeyIdentifier) {
        if (!platform || !signerOrPublicKey) throw new Error('Instantiation parameter error.')
        return new NextIDStorage(proofIdentity, platform, signerOrPublicKey, SharedContextRef.value.signWithPersona)
    }
}
export const Web3Storage = new Web3StorageAPI()
