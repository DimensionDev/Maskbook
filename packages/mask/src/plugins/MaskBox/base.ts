import type { Plugin } from '@masknet/plugin-infra'
import { languages } from './locales/languages'
import { PLUGIN_ID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
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
    contribution: {
        postContent: new Set(['https://box-beta.mask.io', 'https://box.mask.io']),
    },
}
