import type { Plugin } from '@masknet/plugin-infra'
import { PLUGIN_ID, PLUGIN_NAME, PLUGIN_DESCRIPTION } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        supports: { type: 'opt-out', sites: {} },
        target: 'stable',
        host_permissions: ['https://gitcoin.co/'],
    },
    inMinimalModeByDefault: true,
    contribution: { postContent: new Set([/https:\/\/gitcoin.co\/grants\/\d+/]) },
    i18n: languages,
}
