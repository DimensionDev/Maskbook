import type { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { type Web3StorageServiceState, StorageProviderType, type Storage } from '@masknet/web3-shared-base'

export class StorageState implements Web3StorageServiceState {
    constructor(
        public createStorage: (
            providerType: StorageProviderType,
            options: {
                namespace: string
                userId?: string
                address?: string
                platform?: NextIDPlatform
                signerOrPublicKey?: string | ECKeyIdentifier
            },
        ) => Storage,
    ) {}

    createKVStorage(namespace: string) {
        return this.createStorage(StorageProviderType.KV, { namespace })
    }

    createStringStorage(namespace: string, address: string) {
        return this.createStorage(StorageProviderType.String, { namespace, address })
    }

    createRSS3Storage(namespace: string) {
        return this.createStorage(StorageProviderType.RSS3, { namespace })
    }

    createNextIDStorage(proofIdentity: string, platform: NextIDPlatform, signerOrPublicKey: string | ECKeyIdentifier) {
        return this.createStorage(StorageProviderType.NextID, {
            namespace: proofIdentity,
            signerOrPublicKey,
            platform,
        })
    }
}
