import type { Plugin } from '@masknet/plugin-infra'
import { languages } from './locales'
import { PLUGIN_IDENTIFIER } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_IDENTIFIER,
    icon: '🎁',
    name: { fallback: 'MaskBox' },
    description: { fallback: 'The mystery box with NFT inside which is provided by Mask Network.' },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    experimentalMark: true,
    i18n: languages,
}
