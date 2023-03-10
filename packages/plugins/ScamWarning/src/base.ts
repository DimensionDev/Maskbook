import type { Plugin } from '@masknet/plugin-infra'
import { PLUGIN_DESCRIPTION, PLUGIN_ID, PLUGIN_NAME } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'CryptoScamDB' }, link: 'https://cryptoscamdb.org' },
    enableRequirement: {
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
    },
    experimentalMark: true,
    i18n: languages,
}
