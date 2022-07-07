import { CurrentSNSNetwork, Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { GamePluginID } from './constants'
import { languages } from './locales/languages'

export const base: Plugin.Shared.Definition = {
    ID: GamePluginID,
    name: { fallback: 'Game' },
    description: {
        fallback: 'Play game with your NFT.',
    },
    publisher: { name: { fallback: '' }, link: 'https://github.com/HelloWeb3Team' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: {
            type: 'opt-in',
            networks: {
                [CurrentSNSNetwork.Twitter]: true,
                [CurrentSNSNetwork.Facebook]: true,
                [CurrentSNSNetwork.Instagram]: true,
                [CurrentSNSNetwork.Minds]: true,
            },
        },
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [ChainId.Mainnet],
            },
        },
        target: 'stable',
    },
    i18n: languages,
}
