import { StorageProviderType } from '@masknet/web3-shared-base'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import { StorageState } from '@masknet/plugin-infra/web3'
import { unreachable } from '@dimensiondev/kit'
import { KVStorage, NextIDStorage } from '@masknet/shared'
import { SharedContextSettings } from '../../settings'

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
            throw new Error('RSS3 storage is not support sol')
        case StorageProviderType.NextID:
            if (!options?.personaIdentifier)
                throw new Error('personaIdentifier is required when providerType is NextID')
            return new NextIDStorage(
                options.namespace,
                options.personaIdentifier,
                SharedContextSettings.value.generateSignResult,
            )
        default:
            unreachable(providerType)
    }
}

export class Storage extends StorageState {
    constructor() {
        super(createStorage)
    }
}
