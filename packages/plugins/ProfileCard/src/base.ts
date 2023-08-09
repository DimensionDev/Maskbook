import { PLUGIN_ID } from './constants.js'
import { languages } from './locales/languages.js'
import { type Plugin, SiteAdaptor } from '@masknet/plugin-infra'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: 'Web3 Profile Card' },
    description: {
        fallback: 'Web3 Profile Card on social account avatar.',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
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
