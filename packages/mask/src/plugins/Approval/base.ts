import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { ApprovalPluginID } from './constants'
import { languages } from './locales/languages'

export const base: Plugin.Shared.Definition = {
    ID: ApprovalPluginID,
    name: { fallback: 'Approval' },
    description: {
        fallback: '',
    },
    publisher: { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: {
            type: 'opt-out',
            networks: {},
        },
        target: 'stable',
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [
                    ChainId.Mainnet,
                    ChainId.BSC,
                    ChainId.Matic,
                    ChainId.Arbitrum,
                    ChainId.xDai,
                    ChainId.Fantom,
                    ChainId.Celo,
                    ChainId.Avalanche,
                    ChainId.Aurora,
                    ChainId.Harmony,
                ],
            },
            [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },
    i18n: languages,
}
