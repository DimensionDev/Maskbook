import type { Plugin } from '@masknet/plugin-infra'
import { PLUGIN_DESCRIPTION, PLUGIN_ID, PLUGIN_NAME } from './constants.js'
import { languages, linguiLanguages } from './locales/languages.js'
import { EnhanceableSite } from '@masknet/shared-base'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: '' }, link: '' },
    enableRequirement: {
        supports: {
            type: 'opt-out',
            sites: {
                [EnhanceableSite.Localhost]: true,
            },
        },
        target: 'stable',
    },
    experimentalMark: true,
    i18n: [languages, linguiLanguages],
}
