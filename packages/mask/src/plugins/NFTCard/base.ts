import { CurrentSNSNetwork, Plugin } from '@masknet/plugin-infra'
import { PLUGIN_ID, PLUGIN_NAME } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: PLUGIN_NAME },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: {
            type: 'opt-in',
            networks: {
                [CurrentSNSNetwork.Twitter]: true,
            },
        },
        target: 'stable',
    },
    experimentalMark: true,
}
