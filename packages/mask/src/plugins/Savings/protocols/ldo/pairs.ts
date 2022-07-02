import { LidoProtocol } from './LDOProtocol'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { ChainId, createERC20Tokens, createNativeToken, SchemaType } from '@masknet/web3-shared-evm'

export const LDO_PAIRS_LIST: Array<[FungibleToken<ChainId, SchemaType>, FungibleToken<ChainId, SchemaType>]> = [
    [
        createNativeToken(ChainId.Mainnet),
        createERC20Tokens('LDO_stETH_ADDRESS', 'Liquid staked Ether 2.0', 'stETH', 18)[ChainId.Mainnet],
    ],
]

export const LDO_PAIRS = LDO_PAIRS_LIST.map((pair) => new LidoProtocol(pair))
