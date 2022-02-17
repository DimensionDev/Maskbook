import { CurrentSNSNetwork, Plugin } from '@masknet/plugin-infra'
import { PLUGIN_DESCRIPTION, PLUGIN_ID, PLUGIN_NAME } from './constants'
import { languages } from './locales/languages'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    description: { fallback: PLUGIN_DESCRIPTION },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: {
            type: 'opt-out',
            networks: {
                [CurrentSNSNetwork.Instagram]: true,
                [CurrentSNSNetwork.Facebook]: true,
                [CurrentSNSNetwork.Minds]: true,
            },
        },
        target: 'stable',
    },
    experimentalMark: true,
    i18n: languages,
}
