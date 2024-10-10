import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER } from '@masknet/shared-base'
import { CYBERCONNECT_PLUGIN_ID } from './constants.js'
import { languages } from './locale/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: CYBERCONNECT_PLUGIN_ID,
    name: { fallback: 'CyberConnect' },
    description: {
        fallback: 'A plugin for https://cyberconnect.me/',
    },
    publisher: DEFAULT_PLUGIN_PUBLISHER,
    enableRequirement: {
        supports: { type: 'opt-in', sites: {} },
        target: 'insider',
    },
    contribution: { postContent: new Set([/https:\/\/app.cyberconnect.me/]) },
    i18n: languages,
}
