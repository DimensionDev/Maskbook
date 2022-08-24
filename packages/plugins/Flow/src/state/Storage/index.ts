import { StorageProviderType } from '@masknet/web3-shared-base'
import type { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { StorageState } from '@masknet/plugin-infra/web3'
import { unreachable } from '@dimensiondev/kit'
import { KVStorage, NextIDStorage } from '@masknet/shared'
import { SharedContextSettings } from '../../settings'

function createStorage(
    providerType: StorageProviderType,
    options: {
        namespace: string
        publicKeyAsHex?: string
        signer?: ECKeyIdentifier
        address?: string
        platform?: NextIDPlatform
    },
) {
    switch (providerType) {
        case StorageProviderType.KV:
            return new KVStorage(options.namespace)
        case StorageProviderType.RSS3:
            throw new Error('RSS3 storage is not support flow')
        case StorageProviderType.NextID:
            if (!options?.platform || !options.publicKeyAsHex)
                throw new Error('platform and personaIdentifier is required When providerType is NextID')
            return new NextIDStorage(
                options.namespace,
                options.platform,
                options.publicKeyAsHex,
                options.signer,
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
