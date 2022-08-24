import type { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { Web3StorageServiceState, StorageProviderType, Storage } from '@masknet/web3-shared-base'

export class StorageState implements Web3StorageServiceState {
    constructor(
        public createStorage: (
            providerType: StorageProviderType,
            options: {
                namespace: string
                publicKeyAsHex?: string
                platform?: NextIDPlatform
                signer?: ECKeyIdentifier
            },
        ) => Storage,
    ) {}

    createKVStorage(namespace: string) {
        return this.createStorage(StorageProviderType.KV, { namespace })
    }

    createRSS3Storage(namespace: string) {
        return this.createStorage(StorageProviderType.RSS3, { namespace })
    }

    createNextIDStorage(
        proofIdentity: string,
        platform: NextIDPlatform,
        publicKeyAsHex: string,
        signer?: ECKeyIdentifier,
    ) {
        return this.createStorage(StorageProviderType.NextID, {
            namespace: proofIdentity,
            publicKeyAsHex,
            signer,
            platform,
        })
    }
}
