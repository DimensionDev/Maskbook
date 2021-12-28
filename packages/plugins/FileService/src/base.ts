import type { Plugin } from '@masknet/plugin-infra'
import { PluginID_FileService } from '@masknet/shared-base'
import { languages } from './locales/languages'
export const base: Plugin.Shared.Definition = {
    ID: PluginID_FileService,
    icon: '📃',
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
