import { StorageProviderType } from '@masknet/web3-shared-base'
import type { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { StorageState } from '@masknet/plugin-infra/web3'
import { unreachable } from '@dimensiondev/kit'
import { KVStorage, RSS3Storage, NextIDStorage } from '@masknet/shared'
import { SharedContextSettings, Web3StateSettings } from '../../settings'

function createStorage(
    providerType: StorageProviderType,
    options: {
        namespace: string
        personaIdentifier?: ECKeyIdentifier
        platform?: NextIDPlatform
    },
) {
    switch (providerType) {
        case StorageProviderType.KV:
            return new KVStorage(options.namespace)
        case StorageProviderType.RSS3:
            return new RSS3Storage(options.namespace, Web3StateSettings.value.Connection?.getConnection)
        case StorageProviderType.NextID:
            if (!options?.platform || !options.personaIdentifier)
                throw new Error('platform and personaIdentifier is required When providerType is NextID')
            return new NextIDStorage(
                options.namespace,
                options.platform,
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
