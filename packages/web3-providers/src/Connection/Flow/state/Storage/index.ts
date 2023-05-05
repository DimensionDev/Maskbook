import { unreachable } from '@masknet/kit'
import { StorageProviderType } from '@masknet/web3-shared-base'
import type { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { KVStorage, NextIDStorage } from '@masknet/web3-providers'
import { StorageState } from '../../../Base/state/Storage.js'
import { SharedUIContextRef } from '../../../../PluginContext/index.js'

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
            throw new Error("RSS3 storage doesn't support flow.")
        case StorageProviderType.NextID:
            if (!options?.platform || !options.signerOrPublicKey) throw new Error('Instantiation parameter error.')
            return new NextIDStorage(
                options.namespace,
                options.platform,
                options.signerOrPublicKey,
                SharedUIContextRef.value.signWithPersona,
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
