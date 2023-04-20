import { unreachable } from '@masknet/kit'
import { StorageProviderType } from '@masknet/web3-shared-base'
import type { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { KVStorage, NextIDStorage, RSS3Storage, StringStorage } from '@masknet/web3-providers'
import { Web3StateRef } from '../../apis/Web3StateAPI.js'
import { StorageState } from '../../../Base/state/Storage.js'
import { SharedUIContextRef } from '../../../../PluginContext/index.js'

function createStorage(
    providerType: StorageProviderType,
    options: {
        namespace: string
        platform?: NextIDPlatform
        address?: string
        signerOrPublicKey?: string | ECKeyIdentifier
    },
) {
    switch (providerType) {
        case StorageProviderType.KV:
            return new KVStorage(options.namespace)
        case StorageProviderType.RSS3:
            return new RSS3Storage(options.namespace, () => Web3StateRef.value.Connection?.getConnection?.())
        case StorageProviderType.NextID:
            if (!options?.platform || !options.signerOrPublicKey) throw new Error('Instantiation parameter error.')
            return new NextIDStorage(
                options.namespace,
                options.platform,
                options.signerOrPublicKey,
                SharedUIContextRef.value.signWithPersona,
            )
        case StorageProviderType.String:
            return new StringStorage(options.namespace, options.address || '', () =>
                Web3StateRef.value.Connection?.getConnection?.(),
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
