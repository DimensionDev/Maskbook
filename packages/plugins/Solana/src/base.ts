import type { Plugin } from '@masknet/plugin-infra'
import {
    CHAIN_DESCRIPTORS,
    ChainId,
    NETWORK_DESCRIPTORS,
    NetworkType,
    PROVIDER_DESCRIPTORS,
    ProviderType,
    SchemaType,
} from '@masknet/web3-shared-solana'
import { languages } from './locales/languages.js'
import { PLUGIN_DESCRIPTION, PLUGIN_ID, PLUGIN_NAME } from './constants.js'

export const base: Plugin.Shared.Definition<ChainId, SchemaType, ProviderType, NetworkType> = {
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
    declareWeb3Chains: CHAIN_DESCRIPTORS,
    declareWeb3Networks: NETWORK_DESCRIPTORS,
    declareWeb3Providers: PROVIDER_DESCRIPTORS,
}
