import { type Plugin, PluginId } from '@masknet/plugin-infra'
import { languages } from './locales/languages'
import { META_KEY_1, META_KEY_2 } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: PluginId.FileService,
    name: { fallback: 'Files Service' },
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
