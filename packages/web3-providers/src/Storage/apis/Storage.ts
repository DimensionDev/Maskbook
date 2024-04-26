import type { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { KVStorage } from '../storages/KV.js'
import * as NextIDStorage from /* webpackDefer: true */ '../storages/NextID.js'
import * as RSS3Storage from /* webpackDefer: true */ '../storages/RSS3.js'
import * as FireflyStorage from /* webpackDefer: true */ '../storages/Firefly.js'
import type { WalletAPI } from '../../entry-types.js'

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

    static createNextIDStorage(
        proofIdentity: string,
        platform: NextIDPlatform,
        signerOrPublicKey: string | ECKeyIdentifier,
        signWithPersona: WalletAPI.SignWithPersona,
    ) {
        if (!platform || !signerOrPublicKey) throw new Error('Instantiation parameter error.')
        return new NextIDStorage.NextIDStorage(proofIdentity, platform, signerOrPublicKey, signWithPersona)
    }
}
