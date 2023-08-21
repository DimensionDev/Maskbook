import { type Plugin, SiteAdaptor } from '@masknet/plugin-infra'
import { DEFAULT_PLUGIN_PUBLISHER } from '@masknet/shared-base'
import { PLUGIN_ID } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: 'Avatar' },
    description: {
        fallback: 'NFT Avatar.',
    },
    publisher: DEFAULT_PLUGIN_PUBLISHER,
    enableRequirement: {
        supports: {
            type: 'opt-in',
            sites: {
                [SiteAdaptor.Twitter]: true,
                [SiteAdaptor.Facebook]: false,
                [SiteAdaptor.Instagram]: false,
            },
        },
        target: 'stable',
    },

    i18n: languages,
}
