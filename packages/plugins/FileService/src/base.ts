import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER, EnhanceableSite, PluginID } from '@masknet/shared-base'
import { languages } from './locale/languages.js'
import { META_KEY_1, META_KEY_2, META_KEY_3 } from './constants.js'

export const base: Plugin.Shared.Definition = {
    ID: PluginID.FileService,
    name: { fallback: 'File Service' },
    description: {
        fallback: 'Upload and share files on top of Arweave network. Store data, permanently.',
    },
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
    i18n: languages,
    contribution: {
        metadataKeys: new Set([META_KEY_1, META_KEY_2, META_KEY_3]),
    },
}
