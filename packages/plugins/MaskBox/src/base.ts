import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import { languages } from './locales/languages.js'
import { PLUGIN_ID } from './constants.js'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: 'MaskBox' },
    description: { fallback: 'The mystery box with NFT inside which is provided by Mask Network.' },
    publisher: DEFAULT_PLUGIN_PUBLISHER,
    enableRequirement: {
        supports: {
            type: 'opt-out',
            sites: {
                [EnhanceableSite.Localhost]: true,
                [ExtensionSite.Dashboard]: true,
                [ExtensionSite.Popup]: true,
                [ExtensionSite.PopupConnect]: true,
            },
        },
        target: 'stable',
    },
    experimentalMark: true,
    i18n: languages,
    contribution: {
        postContent: new Set(['https://box-beta.mask.io', 'https://box.mask.io']),
    },
}
