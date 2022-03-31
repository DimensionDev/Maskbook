import { CurrentSNSNetwork, Plugin, NetworkPluginID } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'
import { PetsPluginID } from './constants'
import { PETSIcon } from '../../resources/PETSIcon'

export const base: Plugin.Shared.Definition = {
    ID: PetsPluginID,
    icon: <PETSIcon />,
    name: { fallback: 'Non-Fungible Friends' },
    description: {
        fallback: 'Explore the endless possibilities of NFTs.',
    },
    publisher: { name: { fallback: '' }, link: 'https://github.com/etouyang/' },
    enableRequirement: {
        architecture: { app: false, web: true },
        networks: { type: 'opt-in', networks: { [CurrentSNSNetwork.Twitter]: true } },
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [ChainId.Mainnet],
            },
            [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
            [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
        },
        target: 'stable',
    },
}
