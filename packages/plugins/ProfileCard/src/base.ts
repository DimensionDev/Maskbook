import { DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite } from '@masknet/shared-base'
import { type Plugin } from '@masknet/plugin-infra'
import { PLUGIN_ID } from './constants.js'
import { languages } from './locale/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: 'Web3 Profile Card' },
    description: {
        fallback: 'Web3 Profile Card on social account avatar.',
    },
    publisher: DEFAULT_PLUGIN_PUBLISHER,
    enableRequirement: {
        supports: {
            type: 'opt-in',
            sites: {
                [EnhanceableSite.Twitter]: true,
            },
        },
        target: 'stable',
    },

    i18n: languages,
}
