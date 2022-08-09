import type { ECKeyIdentifier } from '@masknet/shared-base'
import type { Web3StorageServiceState, StorageProviderType, Storage } from '@masknet/web3-shared-base'

export class StorageState implements Web3StorageServiceState {
    constructor(
        protected createStorage: (
            providerType: StorageProviderType,
            options: {
                namespace: string
                personaIdentifier: ECKeyIdentifier
                address: string
            },
        ) => Storage,
    ) {}

    getStorage(
        providerType: StorageProviderType,
        options: {
            namespace: string
            personaIdentifier: ECKeyIdentifier
            address: string
        },
    ) {
        return Promise.resolve(this.createStorage(providerType, options))
    }
}
