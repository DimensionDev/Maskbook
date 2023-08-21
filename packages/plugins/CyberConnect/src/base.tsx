import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PLULISHER } from '@masknet/shared-base'
import { CYBERCONNECT_PLUGIN_ID } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: CYBERCONNECT_PLUGIN_ID,
    name: { fallback: 'CyberConnect' },
    description: {
        fallback: 'A plugin for https://cyberconnect.me/',
    },
    publisher: DEFAULT_PLUGIN_PLULISHER,
    enableRequirement: {
        supports: { type: 'opt-out', sites: {} },
        target: 'stable',
    },
    contribution: { postContent: new Set([/https:\/\/app.cyberconnect.me/]) },
    i18n: languages,
}
