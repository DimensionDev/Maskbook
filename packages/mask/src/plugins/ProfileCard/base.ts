import { PLUGIN_ID } from './constants'
import { languages } from './locales/languages'
import { Plugin, CurrentSNSNetwork } from '@masknet/plugin-infra'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: 'Avatar Web3 Profile Card' },
    description: {
        fallback: 'Web3 Profile Card on social account avatar.',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
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
