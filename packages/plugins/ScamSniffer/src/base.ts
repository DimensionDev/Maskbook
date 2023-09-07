import type { Plugin } from '@masknet/plugin-infra'
import { ExtensionSite } from '@masknet/shared-base'
import { PLUGIN_DESCRIPTION, PLUGIN_ID, PLUGIN_NAME } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'Scam Sniffer' }, link: 'https://scamsniffer.io/?utm_source=mask-plugin' },
    enableRequirement: {
        supports: {
            type: 'opt-out',
            sites: {
                [ExtensionSite.Dashboard]: true,
                [ExtensionSite.Popup]: true,
                [ExtensionSite.PopupConnect]: true,
            },
        },
        target: 'stable',
    },
    inMinimalModeByDefault: true,
    experimentalMark: true,
    i18n: languages,
}
