import { ChainId, createERC20Tokens, createNativeToken, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { LidoProtocol } from './LDOProtocol'

export const LDO_PAIRS_LIST: Array<[FungibleTokenDetailed, FungibleTokenDetailed]> = [
    [
        createNativeToken(ChainId.Mainnet),
        createERC20Tokens('LDO_stETH_ADDRESS', 'Liquid staked Ether 2.0', 'stETH', 18)[ChainId.Mainnet],
    ],
]

export const LDO_PAIRS = LDO_PAIRS_LIST.map((pair) => new LidoProtocol(pair))
