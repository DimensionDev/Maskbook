import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite, PluginID } from '@masknet/shared-base'
import { languages } from './locale/languages.js'

export const PLUGIN_NAME = 'Gitcoin'
export const base: Plugin.Shared.Definition = {
    ID: PluginID.Gitcoin,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: 'Gitcoin grants sustain web3 projects with quadratic funding.' },
    publisher: DEFAULT_PLUGIN_PUBLISHER,
    enableRequirement: {
        supports: {
            type: 'opt-out',
            sites: {
                [EnhanceableSite.Localhost]: true,
            },
        },
        target: 'stable',
    },
    contribution: { postContent: new Set([/^https:\/\/explorer\.gitcoin\.co\/#\/projects\/0x[\dA-Fa-f]{64}/]) },
    i18n: languages,
}
