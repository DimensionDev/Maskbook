import type { Plugin } from '@masknet/plugin-infra'
import { EnhanceableSite, PluginID } from '@masknet/shared-base'
import { PLUGIN_DESCRIPTION, PLUGIN_NAME } from './constants.js'
import { languages } from './locale/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PluginID.FriendTech,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: '' }, link: '' },
    enableRequirement: {
        supports: {
            type: 'opt-out',
            sites: {
                [EnhanceableSite.Localhost]: true,
            },
        },
        target: 'stable',
        web3: {},
    },
    inMinimalModeByDefault: true,
    experimentalMark: true,
    i18n: languages,
}
