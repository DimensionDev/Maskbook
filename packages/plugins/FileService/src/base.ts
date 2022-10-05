import { type Plugin } from '@masknet/plugin-infra'
import { PluginID } from '@masknet/shared-base'
import { languages } from './locales/languages.js'
import { META_KEY_1, META_KEY_2 } from './constants.js'

export const base: Plugin.Shared.Definition = {
    ID: PluginID.FileService,
    name: { fallback: 'File Service', i18nKey: '__display_name' },
    description: {
        fallback: 'Upload and share files on top of Arweave network. Store data, permanently.',
        i18nKey: '__description',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    i18n: languages,
    contribution: {
        metadataKeys: new Set([META_KEY_1, META_KEY_2]),
    },
}
