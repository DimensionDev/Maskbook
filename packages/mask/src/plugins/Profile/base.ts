import { PLUGIN_ID } from './constants'
import { CurrentSNSNetwork, Plugin } from '@masknet/plugin-infra'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: 'Profile' },
    description: {
        fallback: 'Improve profile.',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-in', networks: { [CurrentSNSNetwork.Twitter]: true } },
        target: 'stable',
    },
}
