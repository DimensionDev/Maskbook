import { Plugin, PluginId } from '@masknet/plugin-infra'
import { languages } from './locales/languages'

export const base: Plugin.Shared.Definition = {
    ID: PluginId.Tips,
    name: { fallback: 'Tips' },
    description: {
        fallback: 'Tips Entrance',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: {
            type: 'opt-out',
            networks: {},
        },
        target: 'stable',
    },
    i18n: languages,
}
