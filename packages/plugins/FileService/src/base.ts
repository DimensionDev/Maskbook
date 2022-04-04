import { Plugin, PluginId } from '@masknet/plugin-infra'
import { languages } from './locales/languages'

export const base: Plugin.Shared.Definition = {
    ID: PluginId.FileService,
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
}
