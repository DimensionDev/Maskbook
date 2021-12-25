import type { Plugin } from '@masknet/plugin-infra'
import { SAVINGS_PLUGIN_ID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: SAVINGS_PLUGIN_ID,
    icon: '💰',
    name: { fallback: 'Savings' },
    description: {
        fallback: 'A plugin for Savings',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
