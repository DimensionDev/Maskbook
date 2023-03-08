import { PLUGIN_ID } from './constants.js'
import { languages } from './locales/languages.js'
import { type Plugin, CurrentSNSNetwork } from '@masknet/plugin-infra'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: 'Web3 Profile Card' },
    description: {
        fallback: 'Web3 Profile Card on social account avatar.',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        networks: {
            type: 'opt-in',
            networks: {
                [CurrentSNSNetwork.Twitter]: true,
                [CurrentSNSNetwork.Facebook]: false,
                [CurrentSNSNetwork.Instagram]: false,
            },
        },
        target: 'stable',
    },

    i18n: languages,
}
