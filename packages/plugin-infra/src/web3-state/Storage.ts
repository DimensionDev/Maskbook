import type { ECKeyIdentifier } from '@masknet/shared-base'
import { Web3StorageServiceState, StorageProviderType, Storage } from '@masknet/web3-shared-base'

export class StorageState implements Web3StorageServiceState {
    constructor(
        public createStorage: (
            providerType: StorageProviderType,
            options: {
                namespace: string
                personaIdentifier?: ECKeyIdentifier
                address?: string
            },
        ) => Storage,
    ) {}

    createKVStorage(namespace: string) {
        return this.createStorage(StorageProviderType.KV, { namespace })
    }

    createRSS3Storage(namespace: string, address: string) {
        return this.createStorage(StorageProviderType.RSS3, { namespace, address })
    }

    createNextIDStorage(namespace: string, personaIdentifier: ECKeyIdentifier) {
        return this.createStorage(StorageProviderType.NextID, { namespace, personaIdentifier })
    }
}
