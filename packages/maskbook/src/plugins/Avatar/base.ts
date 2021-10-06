import { PLUGIN_ID } from './constants'
import type { Plugin } from '@masknet/plugin-infra'
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
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
        web3: {
            operatingSupportedChains: [ChainId.Mainnet],
        },
    },
}
