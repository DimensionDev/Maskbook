import type { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { KVStorage } from '../storages/KV.js'
import { NextIDStorage } from '../storages/NextID.js'
import { RSS3Storage } from '../storages/RSS3.js'
import { FireflyStorage } from '../storages/Firefly.js'
import { io } from '../../Manager/io.js'

export class Web3Storage {
    static createKVStorage(namespace: string) {
        return new KVStorage(namespace)
    }

    static createFireflyStorage(namespace: string, address: string) {
        return new FireflyStorage(namespace, address || '')
    }

    static createRSS3Storage(namespace: string) {
        return new RSS3Storage(namespace)
    }

    static createNextIDStorage(
        proofIdentity: string,
        platform: NextIDPlatform,
        signerOrPublicKey: string | ECKeyIdentifier,
    ) {
        if (!platform || !signerOrPublicKey) throw new Error('Instantiation parameter error.')
        return new NextIDStorage(proofIdentity, platform, signerOrPublicKey, io.signWithPersona)
    }
}
