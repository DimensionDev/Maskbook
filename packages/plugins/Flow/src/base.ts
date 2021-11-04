import type { Plugin } from '@masknet/plugin-infra'
import { languages } from './locales'
import { PLUGIN_ID, PLUGIN_ICON, PLUGIN_NAME, PLUGIN_DESCRIPTION, PLUGIN_PROVIDERS, PLUGIN_NETWORKS } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    icon: PLUGIN_ICON,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    i18n: languages,
    networks: PLUGIN_NETWORKS,
    providers: PLUGIN_PROVIDERS,
}
