import { SiteAdaptor, type Plugin } from '@masknet/plugin-infra'
import { PLUGIN_DESCRIPTION, PLUGIN_ID, PLUGIN_NAME } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: '' }, link: '' },
    enableRequirement: {
        supports: {
            type: 'opt-in',
            sites: {
                [SiteAdaptor.Twitter]: true,
                [SiteAdaptor.Facebook]: false,
                [SiteAdaptor.Instagram]: false,
                [SiteAdaptor.MaskIO]: true,
            },
        },
        target: 'stable',
    },
    i18n: languages,
}
