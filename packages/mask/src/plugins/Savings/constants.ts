import { ChainId, createERC20Tokens, createNativeToken, FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export const SAVINGS_PLUGIN_NAME = 'Savings'
export const SAVINGS_PLUGIN_ID = 'com.savings'

export const LDO_PAIRS: [FungibleTokenDetailed, FungibleTokenDetailed][] = [
    [
        createNativeToken(ChainId.Mainnet),
        createERC20Tokens('LDO_stETH_ADDRESS', 'Liquid staked Ether 2.0', 'stETH', 18)[ChainId.Mainnet],
    ],
]

export const BENQI_COMPTROLLER = '0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4'
export const COMPOUND_COMPTROLLER = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b'
