import type { Plugin } from '@masknet/plugin-infra'
import { BARNBRIDGE_PLUGIN_ID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: BARNBRIDGE_PLUGIN_ID,
    icon: '🌉',
    name: { fallback: 'BarnBridge' },
    description: {
        fallback:
            'BarnBridge is a protocol that enables users to hedge against DeFi yield sensitivity and price volatility',
    },
    publisher: { name: { fallback: 'BarnBridge' }, link: 'https://barnbridge.com/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'insider',
    },
    experimentalMark: true,
}
