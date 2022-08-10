import { StorageProviderType } from '@masknet/web3-shared-base'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import { StorageState } from '@masknet/plugin-infra/web3'
import { unreachable } from '@dimensiondev/kit'
import { KVStorage } from './KV'
import { RSS3Storage } from './RSS3'
import { NextIDStorage } from './NextID'

function createStorage(
    providerType: StorageProviderType,
    options: {
        namespace: string
        personaIdentifier?: ECKeyIdentifier
        address?: string
    },
) {
    switch (providerType) {
        case StorageProviderType.KV:
            return new KVStorage(options.namespace)
        case StorageProviderType.RSS3:
            if (!options?.address) throw new Error('address is required when providerType is RSS3')
            return new RSS3Storage(options.address)
        case StorageProviderType.NextID:
            if (!options?.personaIdentifier)
                throw new Error('personaIdentifier is required when providerType is NextID')
            return new NextIDStorage(options.namespace, options.personaIdentifier)
        default:
            unreachable(providerType)
    }
}

export class Storage extends StorageState {
    constructor() {
        super(createStorage)
    }
}
