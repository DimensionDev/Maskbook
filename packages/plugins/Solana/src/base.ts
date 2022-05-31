import type { Plugin } from '@masknet/plugin-infra'
import {
    NETWORK_DESCRIPTORS,
    PROVIDER_DESCRIPTORS,
    ChainId,
    NetworkType,
    ProviderType,
} from '@masknet/web3-shared-solana'
import { languages } from './locales/languages'
import { PLUGIN_ID, PLUGIN_NAME, PLUGIN_DESCRIPTION } from './constants'

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
