import type { Plugin } from '@masknet/plugin-infra'
import { CYBERCONNECT_PLUGIN_ID } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: CYBERCONNECT_PLUGIN_ID,
    name: { fallback: 'CyberConnect' },
    description: {
        fallback: 'A plugin for https://cyberconnect.me/',
    },
    publisher: { name: { fallback: 'CyberConnect' }, link: 'https://github.com/cyberconnecthq' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    contribution: { postContent: new Set([/https:\/\/app.cyberconnect.me/]) },
    i18n: languages,
}
