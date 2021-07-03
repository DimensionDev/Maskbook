import { createERC20Tokens, getChainDetailed } from '@masknet/web3-shared'

export const GOOD_GHOSTING_PLUGIN_ID = 'co.good_ghosting'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const DAI = createERC20Tokens('DAI_ADDRESS', 'Dai Stablecoin', 'DAI', 18)
export const WETH = createERC20Tokens(
    'WETH_ADDRESS',
    (chainId) => `Wrapped ${getChainDetailed(chainId)?.nativeCurrency.name ?? 'Ether'}`,
    (chainId) => `W${getChainDetailed(chainId)?.nativeCurrency.symbol ?? 'ETH'}`,
    18,
)
