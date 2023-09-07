import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { GamePluginID } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: GamePluginID,
    name: { fallback: 'Game' },
    description: {
        fallback: 'Play game with your NFT.',
    },
    publisher: { name: { fallback: '' }, link: 'https://github.com/HelloWeb3Team' },
    enableRequirement: {
        supports: {
            type: 'opt-in',
            sites: {},
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
