import type { Plugin } from '@masknet/plugin-infra'
import { PLUGIN_DESCRIPTION, PLUGIN_ID, PLUGIN_NAME } from './constants.js'
import { EnhanceableSite } from '@masknet/shared-base'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: '' }, link: '' },
    enableRequirement: {
        supports: {
            type: 'opt-in',
            sites: {
                [EnhanceableSite.App]: true,
                [EnhanceableSite.Twitter]: true,
            },
        },
        target: 'stable',
    },
    i18n: languages,
}
