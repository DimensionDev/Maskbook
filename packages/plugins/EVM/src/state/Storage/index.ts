import { StorageProviderType } from '@masknet/web3-shared-base'
import type { ECKeyIdentifier, NextIDPlatform } from '@masknet/shared-base'
import { StorageState } from '@masknet/web3-state'
import { unreachable } from '@masknet/kit'
import { KVStorage, RSS3Storage, NextIDStorage, StringStorage } from '@masknet/shared'
import { SharedContextSettings, Web3StateSettings } from '../../settings/index.js'

function createStorage(
    providerType: StorageProviderType,
    options: {
        namespace: string
        platform?: NextIDPlatform
        userId?: string
        address?: string
        signerOrPublicKey?: string | ECKeyIdentifier
    },
) {
    switch (providerType) {
        case StorageProviderType.KV:
            return new KVStorage(options.namespace)
        case StorageProviderType.RSS3:
            return new RSS3Storage(options.namespace, () => Web3StateSettings.value.Connection?.getConnection?.())
        case StorageProviderType.NextID:
            if (!options?.platform || !options.signerOrPublicKey) throw new Error('Instantiation parameter error.')
            return new NextIDStorage(
                options.namespace,
                options.platform,
                options.signerOrPublicKey,
                SharedContextSettings.value.signWithPersona,
            )
        case StorageProviderType.String:
            return new StringStorage(options.namespace, options.userId || '', options.address || '', () =>
                Web3StateSettings.value.Connection?.getConnection?.(),
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
