import { PLUGIN_ID } from './constants'
import { CurrentSNSNetwork, Plugin } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    name: { fallback: 'Avatar' },
    description: {
        fallback: 'NFT Avatar on Twitter.',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-in', networks: { [CurrentSNSNetwork.Twitter]: true } },
        target: 'stable',
        web3: {
            operatingSupportedChains: [ChainId.Mainnet],
        },
    },
}
