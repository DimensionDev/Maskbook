import { ChainId } from '@masknet/web3-shared-evm'
import type { ContractAdresses } from './Azuro/types'

export const PREDICT_PLUGIN_NAME = 'Predict'

export const DEFAULT_LABEL = 'Default'

export const contractAddresses: { [key in ChainId]?: ContractAdresses } = {
    [ChainId.Sokol]: {
        core: '0xEf182ba80c2DA39710Fe0834b5Ac2E8e68820704',
        lp: '0x03792012947c6AC35C3B65eAd42E9edd9B7eD6c4',
        bet: '0x4F0Dc3aAD27379E78C0777f66a07c2ba61B66C71',
        token: '0xf5f125ffFFe359f2Bfe44776B5604eDFa82A0Ff2',
    },
    [ChainId.xDai]: {
        core: '0x4fE6A9e47db94a9b2a4FfeDE8db1602FD1fdd37d',
        lp: '0xac004b512c33D029cf23ABf04513f1f380B3FD0a',
        bet: '0xFd9E5A2A1bfc8B57A288A3e12E2c601b0Cc7e476',
        token: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    },
}
