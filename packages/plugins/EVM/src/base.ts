import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER } from '@masknet/shared-base'
import {
    CHAIN_DESCRIPTORS,
    type ChainId,
    NETWORK_DESCRIPTORS,
    type NetworkType,
    PROVIDER_DESCRIPTORS,
    type ProviderType,
    type SchemaType,
} from '@masknet/web3-shared-evm'
import { PLUGIN_DESCRIPTION, PLUGIN_ID, PLUGIN_NAME } from './constants/index.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition<ChainId, SchemaType, ProviderType, NetworkType> = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: DEFAULT_PLUGIN_PUBLISHER,
    enableRequirement: {
        supports: { type: 'opt-out', sites: {} },
        target: 'stable',
    },
    i18n: languages,
    declareWeb3Chains: CHAIN_DESCRIPTORS,
    declareWeb3Networks: NETWORK_DESCRIPTORS,
    declareWeb3Providers: PROVIDER_DESCRIPTORS,
}
