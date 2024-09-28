import type { Plugin } from '@masknet/plugin-infra'
import { EnhanceableSite } from '@masknet/shared-base'
import { ARTBLOCKS_PLUGIN_ID, PLUGIN_NAME, URL_PATTERN } from './constants.js'
import { languages } from './locale/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: ARTBLOCKS_PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: {
        fallback:
            'Artblocks allow you to pick a style that you like, pay for the work, and a randomly generated version of the content is created by an algorithm and sent to your Ethereum account.',
    },
    publisher: { name: { fallback: 'ArtBlocks' }, link: 'https://www.artblocks.io/' },
    enableRequirement: {
        supports: {
            type: 'opt-out',
            sites: {
                [EnhanceableSite.Localhost]: true,
            },
        },
        target: 'stable',
    },
    contribution: {
        postContent: new Set([URL_PATTERN]),
    },
    i18n: languages,
}
