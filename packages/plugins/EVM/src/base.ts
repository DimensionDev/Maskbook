import type { Plugin } from '@masknet/plugin-infra'
import { ChainId, NetworkType, NETWORK_DESCRIPTORS, ProviderType, PROVIDER_DESCRIPTORS } from '@masknet/web3-shared-evm'
import { PLUGIN_ID, PLUGIN_NAME, PLUGIN_DESCRIPTION } from './constants'
import { languages } from './locales/languages'

export const base: Plugin.Shared.Definition<ChainId, ProviderType, NetworkType> = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    i18n: languages,
    declareWeb3Networks: NETWORK_DESCRIPTORS,
    declareWeb3Providers: PROVIDER_DESCRIPTORS,
}
