import { PluginId } from '@masknet/plugin-infra'
import { createERC20Tokens, getChainDetailed } from '@masknet/web3-shared-evm'

export const PLUGIN_ID = PluginId.GoodGhosting
export const PLUGIN_NAME = 'GoodGhosting'
export const PLUGIN_ICON = '\u{1F47B}'
export const PLUGIN_DESCRIPTION = 'DeFi savings dApp game.'

export const DAI = createERC20Tokens('DAI_ADDRESS', 'Dai Stablecoin', 'DAI', 18)
export const WETH = createERC20Tokens(
    'WNATIVE_ADDRESS',
    (chainId) => `Wrapped ${getChainDetailed(chainId)?.nativeCurrency.name ?? 'Ether'}`,
    (chainId) => `W${getChainDetailed(chainId)?.nativeCurrency.symbol ?? 'ETH'}`,
    18,
)
