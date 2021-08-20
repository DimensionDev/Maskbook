import type { Plugin } from '@masknet/plugin-infra'
import { PLUGIN_DESCRIPTION, PLUGIN_ICON, PLUGIN_IDENTIFIER, PLUGIN_NAME } from './constants'
import { languages } from './locales'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_IDENTIFIER,
    icon: PLUGIN_ICON,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    management: { alwaysOn: true },
    i18n: languages,
}
