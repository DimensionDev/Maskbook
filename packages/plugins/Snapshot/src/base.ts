import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import { SNAPSHOT_PLUGIN_ID } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: SNAPSHOT_PLUGIN_ID,
    name: { fallback: 'Snapshot' },
    description: {
        fallback: 'A plugin for https://snapshot.org/',
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
    contribution: {
        postContent: new Set([/https:\/\/(?:www.)?snapshot.(org|page)\/#\/(.*?)\/proposal\/[\dA-Za-z]+/]),
    },
    i18n: languages,
}
