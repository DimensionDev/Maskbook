import type { Plugin } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'
import { pluginDescription, pluginIcon, pluginName, pluginId } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: pluginId,
    icon: pluginIcon,
    name: { fallback: pluginName },
    description: { fallback: pluginDescription },
    publisher: { name: { fallback: 'Zubin Choudhary' }, link: 'https://www.iamzub.in' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
        web3: {
            supportedOperationalChains: [ChainId.Mainnet, ChainId.xDai, ChainId.Matic, ChainId.Rinkeby],
        },
    },
}
