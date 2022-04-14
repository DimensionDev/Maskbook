import { ChainId, createERC20Tokens, createNativeToken, FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export const LDO_PAIRS: [FungibleTokenDetailed, FungibleTokenDetailed][] = [
    [
        createNativeToken(ChainId.Mainnet),
        createERC20Tokens('LDO_stETH_ADDRESS', 'Liquid staked Ether 2.0', 'stETH', 18)[ChainId.Mainnet],
    ],
]
