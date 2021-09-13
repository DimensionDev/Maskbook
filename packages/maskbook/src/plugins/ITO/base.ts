import type { Plugin } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared'
import { ITO_PluginID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: ITO_PluginID,
    icon: '🚀',
    name: { fallback: 'ITO' },
    description: {
        fallback: 'Participate in Public Offering on Twitter.',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
        web3: {
            operatingSupportedChains: [
                ChainId.Mainnet,
                ChainId.BSC,
                ChainId.Matic,
                ChainId.Mumbai,
                ChainId.Arbitrum,
                ChainId.xDai,
            ],
        },
    },
}
