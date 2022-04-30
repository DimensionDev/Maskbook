import { PLUGIN_ID } from './constants'
import { languages } from './locales/languages'
import { Plugin, CurrentSNSNetwork } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import { ChainId } from '@masknet/web3-shared-evm'

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
            type: 'opt-out',
            networks: {
                [CurrentSNSNetwork.Twitter]: true,
                [CurrentSNSNetwork.Facebook]: false,
                [CurrentSNSNetwork.Instagram]: false,
            },
        },
        target: 'stable',
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [ChainId.Mainnet],
            },
            [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
    },

    i18n: languages,
}
