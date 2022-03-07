import { NetworkPluginID, Plugin } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'
import { ITO_MetaKey_1, ITO_MetaKey_2, ITO_PluginID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: ITO_PluginID,
    icon: '\u{1F680}',
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
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [
                    ChainId.Mainnet,
                    ChainId.BSC,
                    ChainId.Matic,
                    ChainId.Arbitrum,
                    ChainId.xDai,
                    ChainId.Aurora,
                    ChainId.Avalanche,
                    ChainId.Fantom,
                    ChainId.Heco,
                ],
            },
        },
    },
    contribution: { metadataKeys: new Set([ITO_MetaKey_1, ITO_MetaKey_2]) },
}
