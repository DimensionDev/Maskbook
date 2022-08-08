import type { ECKeyIdentifier } from '@masknet/shared-base'
import type { Web3StorageServiceState, StorageProviderType, Storage } from '@masknet/web3-shared-base'

export class StorageState implements Web3StorageServiceState {
    constructor(
        protected createStorage: (
            namespace: string,
            personaIdentifier: ECKeyIdentifier,
            providerType: StorageProviderType,
        ) => Storage,
    ) {}

    getStorage(namespace: string, personaIdentifier: ECKeyIdentifier, providerType: StorageProviderType) {
        return Promise.resolve(this.createStorage(namespace, personaIdentifier, providerType))
    }
}
