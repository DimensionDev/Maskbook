import { ChainId, createERC20Tokens, createNativeToken, FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export const SAVINGS_PLUGIN_NAME = 'Savings'
export const SAVINGS_PLUGIN_ID = 'com.savings'

export const LDO_PAIRS: [FungibleTokenDetailed, FungibleTokenDetailed][] = [
    [
        createNativeToken(ChainId.Mainnet),
        createERC20Tokens('LDO_ADDRESS', 'Lido DAO Token', 'LDO', 18)[ChainId.Mainnet],
    ],
]

export const CONVEX_PAIRS: [FungibleTokenDetailed, FungibleTokenDetailed][] = [
    [
        createERC20Tokens('USDT_ADDRESS', 'Tether USD', 'USDT', 6)[ChainId.Mainnet],
        createERC20Tokens('CONVEX_LP_USDT_ADDRESS', 'Convex  USDT ', 'USDT', 6)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('USDC_ADDRESS', 'WETH', 'WETH', 18)[ChainId.Mainnet],
        createERC20Tokens('CONVEX_LP_USD_ADDRESS', 'Convex  USD', 'USD', 18)[ChainId.Mainnet],
    ],
]
