import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER } from '@masknet/shared-base'
import { PLUGIN_DESCRIPTION, PLUGIN_ID, PLUGIN_NAME } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: DEFAULT_PLUGIN_PUBLISHER,
    enableRequirement: {
        supports: { type: 'opt-out', sites: {} },
        target: 'stable',
    },
    i18n: languages,
}
