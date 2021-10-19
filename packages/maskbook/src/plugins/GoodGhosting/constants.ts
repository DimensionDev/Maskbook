import { createERC20Tokens, getChainDetailed } from '@masknet/web3-shared-evm'

export const PLUGIN_ID = 'co.good_ghosting'
export const PLUGIN_NAME = 'GoodGhosting'
export const PLUGIN_ICON = '👻'
export const PLUGIN_DESCRIPTION = 'DeFi savings dApp game.'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const DAI = createERC20Tokens('DAI_ADDRESS', 'Dai Stablecoin', 'DAI', 18)
export const WETH = createERC20Tokens(
    'WNATIVE_ADDRESS',
    (chainId) => `Wrapped ${getChainDetailed(chainId)?.nativeCurrency.name ?? 'Ether'}`,
    (chainId) => `W${getChainDetailed(chainId)?.nativeCurrency.symbol ?? 'ETH'}`,
    18,
)
