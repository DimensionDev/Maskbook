import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite } from '@masknet/shared-base'
import { PLUGIN_ID } from './constants/index.js'
import { languages } from './locale/languages.js'
import { TRADER_WEB3_CONFIG } from './config.js'

export const base = {
    ID: PLUGIN_ID,
    name: { fallback: 'Trader' },
    description: { fallback: 'View trending of cryptocurrencies, swap ERC20 tokens in various DEX markets.' },
    publisher: DEFAULT_PLUGIN_PUBLISHER,
    enableRequirement: {
        supports: {
            type: 'opt-out',
            sites: {
                [EnhanceableSite.Localhost]: true,
            },
        },
        target: 'stable',
        web3: TRADER_WEB3_CONFIG,
    },
    i18n: languages,
} satisfies Plugin.Shared.Definition
