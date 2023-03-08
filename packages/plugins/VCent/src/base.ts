import type { Plugin } from '@masknet/plugin-infra'
import { PLUGIN_ID, PLUGIN_NAME, PLUGIN_DESCRIPTION } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'rob-low' }, link: 'https://github.com/rob-lw' },
    enableRequirement: {
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    i18n: languages,
}
