import { unreachable } from '@masknet/kit'
import { StorageState } from '@masknet/web3-state'
import { StorageProviderType } from '@masknet/web3-shared-base'
import type { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { KVStorage, NextIDStorage } from '@masknet/web3-providers'
import { SharedContextSettings } from '../../settings/index.js'

function createStorage(
    providerType: StorageProviderType,
    options: {
        namespace: string
        signerOrPublicKey?: string | ECKeyIdentifier
        address?: string
        platform?: NextIDPlatform
    },
) {
    switch (providerType) {
        case StorageProviderType.KV:
            return new KVStorage(options.namespace)
        case StorageProviderType.RSS3:
            throw new Error('RSS3 storage is not support sol')
        case StorageProviderType.NextID:
            if (!options?.platform || !options.signerOrPublicKey) throw new Error('Instantiation parameter error.')
            return new NextIDStorage(
                options.namespace,
                options.platform,
                options.signerOrPublicKey,
                SharedContextSettings.value.signWithPersona,
            )
        case StorageProviderType.String:
            throw new Error('Not supported.')
        default:
            unreachable(providerType)
    }
}

export class Storage extends StorageState {
    constructor() {
        super(createStorage)
    }
}
