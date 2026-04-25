import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite } from '@masknet/shared-base'
import { EFP_PROFILE_URL_PATTERN, PLUGIN_DESCRIPTION, PLUGIN_ID, PLUGIN_NAME } from './constants.js'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
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
    contribution: {
        postContent: new Set([EFP_PROFILE_URL_PATTERN]),
    },
}
