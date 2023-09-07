import type { Plugin } from '@masknet/plugin-infra'
import type { ChainId } from '@masknet/web3-shared-evm'
import { ExtensionSite } from '@masknet/shared-base'
import { languages } from './locales/languages.js'
import { PLUGIN_NAME, PLUGIN_ID, PLUGIN_DESCRIPTION } from './constants.js'

export const base: Plugin.Shared.Definition<ChainId> = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: PLUGIN_NAME }, link: 'https://rss3.bio/' },
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
    experimentalMark: true,
    i18n: languages,
}
