import { CurrentSNSNetwork, type Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { PetsPluginID } from './constants.js'
import { languages } from './locales/languages.js'

export const base: Plugin.Shared.Definition = {
    ID: PetsPluginID,
    name: { fallback: 'Non-Fungible Friends' },
    description: {
        fallback: 'Discover the infinite possibilities of #NFTs.',
    },
    publisher: { name: { fallback: '' }, link: 'https://github.com/HelloWeb3Team' },
    enableRequirement: {
        networks: {
            type: 'opt-in',
            networks: { [CurrentSNSNetwork.Twitter]: true, [CurrentSNSNetwork.__SPA__]: true },
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
