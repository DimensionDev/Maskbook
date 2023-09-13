import { Flags } from '@masknet/flags'
import type { Plugin } from '@masknet/plugin-infra'
import { PluginID, DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite } from '@masknet/shared-base'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PluginID.External,
    name: { fallback: 'Mask External Plugin Loader' },
    description: { fallback: 'Able to load external plugins.' },
    publisher: DEFAULT_PLUGIN_PUBLISHER,
    enableRequirement: {
        supports: {
            type: 'opt-out',
            sites: {
                [EnhanceableSite.Localhost]: true,
            },
        },
        target: Flags.mask_SDK_ready ? 'stable' : 'insider',
    },
    experimentalMark: true,
    i18n: languages,
}
