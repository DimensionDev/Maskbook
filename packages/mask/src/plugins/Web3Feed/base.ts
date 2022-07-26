import { PLUGIN_ID } from './constants'
import { languages } from './locales/languages'
import { Plugin, CurrentSNSNetwork } from '@masknet/plugin-infra'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: 'Web3Feed' },
    description: {
        fallback: 'web3 user collection feed',
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
