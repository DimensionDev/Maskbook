import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import { CYBERCONNECT_PLUGIN_ID } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: CYBERCONNECT_PLUGIN_ID,
    name: { fallback: 'CyberConnect' },
    description: {
        fallback: 'A plugin for https://cyberconnect.me/',
    },
    publisher: DEFAULT_PLUGIN_PUBLISHER,
    enableRequirement: {
        supports: {
            type: 'opt-out',
            sites: {
                [EnhanceableSite.Localhost]: true,
                [ExtensionSite.Dashboard]: true,
                [ExtensionSite.Popup]: true,
                [ExtensionSite.PopupConnect]: true,
            },
        },
        target: 'stable',
    },
    contribution: { postContent: new Set([/https:\/\/app.cyberconnect.me/]) },
    i18n: languages,
}
