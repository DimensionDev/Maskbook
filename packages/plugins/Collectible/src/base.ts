import type { Plugin } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PLULISHER } from '@masknet/shared-base'
import { PLUGIN_DESCRIPTION, PLUGIN_ID, PLUGIN_NAME } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: DEFAULT_PLUGIN_PLULISHER,
    enableRequirement: {
        supports: { type: 'opt-out', sites: {} },
        target: 'stable',
    },
    contribution: {
        postContent: new Set([
            /opensea.io\/assets\/(0x[\dA-Fa-f]{40})\/(\d+)/,
            /rarible.com\/token\/(0x[\dA-Fa-f]{40}):(\d+)/,
            /zora.co\/collections\/(0x[\dA-Fa-f]{40})\/\d+$/,
            /opensea.io\/assets\/ethereum\/(0x[\dA-Fa-f]{40})\/(\d+)/,
        ]),
    },
    i18n: languages,
}
