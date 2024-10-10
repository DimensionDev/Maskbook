import type { Plugin } from '@masknet/plugin-infra'
import { EnhanceableSite } from '@masknet/shared-base'
import { languages, linguiLanguages } from './locales/languages.js'
import { PLUGIN_NAME, PLUGIN_ID, PLUGIN_DESCRIPTION } from './constants.js'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: PLUGIN_NAME }, link: 'https://rss3.bio/' },
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
