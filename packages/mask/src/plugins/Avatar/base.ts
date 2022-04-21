import { PLUGIN_ID } from './constants'
import { CurrentSNSNetwork, Plugin } from '@masknet/plugin-infra'
import { languages } from './locales/languages'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: 'Avatar' },
    description: {
        fallback: 'NFT Avatar.',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: {
            type: 'opt-in',
            networks: {
                [CurrentSNSNetwork.Twitter]: true,
                [CurrentSNSNetwork.Facebook]: true,
                [CurrentSNSNetwork.Instagram]: true,
            },
        },
        target: 'stable',
    },
    i18n: languages,
}
