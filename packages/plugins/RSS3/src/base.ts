import type { Plugin } from '@masknet/plugin-infra'
import { languages } from './locales'
import { PLUGIN_NAME, PLUGIN_ID, PLUGIN_DESCRIPTION } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    icon: '🤔',
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: PLUGIN_NAME }, link: 'https://rss3.bio/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    experimentalMark: true,
    i18n: languages,
}
