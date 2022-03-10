import { ChainId } from '@masknet/web3-shared-evm'
import { Plugin, NetworkPluginID } from '@masknet/plugin-infra'
import { OmenIcon } from '../../resources/OmenIcon'
import { PLUGIN_ID } from './constants'

export const base: Plugin.Shared.Definition = {
    ID: PLUGIN_ID,
    icon: <OmenIcon />,
    name: { fallback: 'Omen' },
    description: {
        fallback: 'Omen is a multichain prediction market developed and governed by @Dxdao_.',
    },
    publisher: { name: { fallback: 'CriptKeeper' }, link: 'https://github.com/CriptKeeper' },
    enableRequirement: {
        architecture: { app: true, web: true },
        networks: { type: 'opt-out', networks: {} },
        target: 'stable',
        web3: {
            [NetworkPluginID.PLUGIN_EVM]: {
                supportedChainIds: [ChainId.xDai],
            },
        },
    },
    contribution: {
        postContent: new Set([/https:\/\/omen.eth.link\/#\/(0x\w+)/]),
    },
}
