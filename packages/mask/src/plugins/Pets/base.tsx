import { CurrentSNSNetwork, Plugin } from '@masknet/plugin-infra'
import { PetsPluginID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: PetsPluginID,
    name: { fallback: 'Non-Fungible Friends' },
    description: {
        fallback: 'Explore the endless possibilities of NFTs.',
    },
    publisher: { name: { fallback: '' }, link: 'https://github.com/etouyang/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-in', networks: { [CurrentSNSNetwork.Twitter]: true } },

        target: 'stable',
    },
}
