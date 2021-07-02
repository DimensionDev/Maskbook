import type { Plugin } from '@masknet/plugin-infra'
import { PLUGIN_IDENTIFIER } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_IDENTIFIER,
    icon: '💱',
    name: { fallback: 'Trader' },
    description: { fallback: 'View trending of cryptocurrencies, swap ERC20 tokens in various DEX markets.' },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
