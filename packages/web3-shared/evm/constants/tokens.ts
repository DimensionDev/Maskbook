import type { Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, ChainIdOptionalRecord } from '../types'
import { createFungibleTokens, getChainDetailed } from '../utils'

export type ERC20AgainstToken = Readonly<ChainIdOptionalRecord<Web3Plugin.FungibleToken[]>>

export const USDC = createFungibleTokens('USDC_ADDRESS', 'USD Coin', 'USDC', 6)
export const USDCe = createFungibleTokens('USDC_ADDRESS', 'USD Coin', 'USDCe', 6)
export const USDT = createFungibleTokens('USDT_ADDRESS', 'Tether USD', 'USDT', 6)
export const USDTe = createFungibleTokens('USDT_ADDRESS', 'Tether USD', 'USDT.e', 6)
export const fUSDT = createFungibleTokens('fUSDT_ADDRESS', 'Frapped USDT', 'fUSDT', 6)
export const HUSD = createFungibleTokens('HUSD_ADDRESS', 'Huobi USD', 'HUSD', 6)
export const BUSD = createFungibleTokens('BUSD_ADDRESS', 'Huobi USD', 'BUSD', 6)
export const COMP = createFungibleTokens('COMP_ADDRESS', 'Compound', 'COMP', 18)
export const MKR = createFungibleTokens('MKR_ADDRESS', 'Maker', 'MKR', 18)
export const DAI = createFungibleTokens('DAI_ADDRESS', 'Dai Stablecoin', 'DAI', 18)
export const DAIe = createFungibleTokens('DAI_ADDRESS', 'Dai Stablecoin', 'DAI.e', 18)
export const AMPL = createFungibleTokens('AMPL_ADDRESS', 'Ampleforth', 'AMPL', 18)
export const OKB = createFungibleTokens('OKB_ADDRESS', 'Ampleforth', 'OKB', 18)
export const UST = createFungibleTokens('UST_ADDRESS', 'Wrapped UST Token', 'UST', 18)
export const EASY = createFungibleTokens('EASY_ADDRESS', 'EASY', 'EASY', 18)
export const eUSDC = createFungibleTokens('eUSDC_ADDRESS', 'Easy USDC', 'eUSDC', 18)
export const eUSDT = createFungibleTokens('eUSDT_ADDRESS', 'Easy USDT', 'eUSDT', 18)
export const eDAI = createFungibleTokens('eDAI_ADDRESS', 'Easy DAI', 'eDAI', 18)
export const sUSD = createFungibleTokens('sUSD_ADDRESS', 'Synth sUSD', 'sUSD', 18)
export const UNITOKEN = createFungibleTokens('UNITOKEN_ADDRESS', 'Uniswap', 'UNI', 18)
export const TT01 = createFungibleTokens('TT01_ADDRESS', 'Test Token 01', 'TT01', 18)
export const TT02 = createFungibleTokens('TT02_ADDRESS', 'Test Token 02', 'TT02', 18)
export const ETHER = createFungibleTokens('ETHER_ADDRESS', 'Ether', 'ETH', 18)
export const QUICK = createFungibleTokens('QUICK_ADDRESS', 'Quickswap', 'QUICK', 18)
export const WANNA = createFungibleTokens('WANNA_ADDRESS', 'Wannaswap', 'WANNA', 18)
export const WBTC = createFungibleTokens('WBTC_ADDRESS', 'Wrapped Bitcoin', 'WBTC', 18)
export const WBTCe = createFungibleTokens('WBTC_ADDRESS', 'Wrapped Bitcoin', 'WBTCe', 18)
export const IGG = createFungibleTokens('IGG_ADDRESS', 'IG Gold', 'IGG', 18)
export const OM = createFungibleTokens('OM_ADDRESS', 'OM Token', 'OM', 18)
export const SUSHI = createFungibleTokens('SUSHI_ADDRESS', 'SushiToken', 'SUSHI', 18)
export const YAM = createFungibleTokens('YAM_ADDRESS', 'YAM', 'YAM', 18)
export const RUNE = createFungibleTokens('RUNE_ADDRESS', 'RUNE.ETH', 'RUNE', 18)
export const YFI = createFungibleTokens('YFI_ADDRESS', 'Yearn', 'YFI', 18)
export const BTCB = createFungibleTokens('BTCB_ADDRESS', 'Binance BTC', 'BTCB', 18)
export const CAKE = createFungibleTokens('CAKE_ADDRESS', 'PancakeSwap Token', 'CAKE', 18)
export const maUSDC = createFungibleTokens('maUSDC_ADDRESS', 'Matic Aave interest bearing USDC', 'maUSDC', 6)
export const NFTX = createFungibleTokens('NFTX_ADDRESS', 'NFTX', 'NFTX', 18)
export const STETH = createFungibleTokens('stETH_ADDRESS', 'stakedETH', 'stETH', 18)
export const CUSD = createFungibleTokens('cUSD_ADDRESS', 'Celo Dollar', 'cUSD', 18)
export const CEUR = createFungibleTokens('cEUR_ADDRESS', 'Celo Euro', 'cEUR', 18)
export const JOE = createFungibleTokens('JOE_ADDRESS', 'JoeToken', 'JOE', 18)
export const PNG = createFungibleTokens('PNG_ADDRESS', 'Pangolin', 'PNG', 18)

export const WNATIVE = createFungibleTokens(
    'WNATIVE_ADDRESS',
    (chainId) => `Wrapped ${getChainDetailed(chainId)?.nativeCurrency.name ?? 'Ether'}`,
    (chainId) => `W${getChainDetailed(chainId)?.nativeCurrency.symbol ?? 'ETH'}`,
    18,
)

export const WNATIVE_ONLY: ERC20AgainstToken = {
    [ChainId.Mainnet]: [WNATIVE[ChainId.Mainnet]],
    [ChainId.Ropsten]: [WNATIVE[ChainId.Ropsten]],
    [ChainId.Rinkeby]: [WNATIVE[ChainId.Rinkeby]],
    [ChainId.Kovan]: [WNATIVE[ChainId.Kovan]],
    [ChainId.Gorli]: [WNATIVE[ChainId.Gorli]],
    [ChainId.BSC]: [WNATIVE[ChainId.BSC]],
    [ChainId.BSCT]: [WNATIVE[ChainId.BSCT]],
    [ChainId.Matic]: [WNATIVE[ChainId.Matic]],
    [ChainId.Mumbai]: [WNATIVE[ChainId.Mumbai]],
    [ChainId.Arbitrum]: [WNATIVE[ChainId.Arbitrum]],
    [ChainId.Arbitrum_Rinkeby]: [WNATIVE[ChainId.Arbitrum_Rinkeby]],
    [ChainId.xDai]: [WNATIVE[ChainId.xDai]],
    [ChainId.Avalanche]: [WNATIVE[ChainId.Avalanche]],
    [ChainId.Avalanche_Fuji]: [WNATIVE[ChainId.Avalanche_Fuji]],
    [ChainId.Celo]: [WNATIVE[ChainId.Celo]],
    [ChainId.Fantom]: [WNATIVE[ChainId.Fantom]],
    [ChainId.Aurora]: [WNATIVE[ChainId.Aurora]],
    [ChainId.Aurora_Testnet]: [WNATIVE[ChainId.Aurora_Testnet]],
}
