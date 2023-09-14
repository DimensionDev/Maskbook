import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER } from '@masknet/shared-base'
import {
    CHAIN_DESCRIPTORS,
    NETWORK_DESCRIPTORS,
    PROVIDER_DESCRIPTORS,
    type ChainId,
    type NetworkType,
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
    contribution: {
        web3: {
            chains: CHAIN_DESCRIPTORS,
            networks: NETWORK_DESCRIPTORS,
            providers: PROVIDER_DESCRIPTORS,
        },
    },
}
