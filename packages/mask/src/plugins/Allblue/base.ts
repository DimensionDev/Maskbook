import type { Plugin } from '@masknet/plugin-infra'
import { ALLBLUE_PLUGIN_ID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: ALLBLUE_PLUGIN_ID,
    icon: '🌊',
    name: { fallback: 'All Blue' },
    description: {
        fallback: 'It is a whodunnit game with a fascinating blend of social communication designed by Allblue.',
    },
    publisher: { name: { fallback: 'All Blue' }, link: 'http://allblue.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
}
