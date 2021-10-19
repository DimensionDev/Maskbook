import { ChainId, createERC20Tokens, getChainDetailed, ONE } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import type { ERC20AgainstToken } from './types'

export const USDC = createERC20Tokens('USDC_ADDRESS', 'USD Coin', 'USDC', 6)
export const USDT = createERC20Tokens('USDT_ADDRESS', 'Tether USD', 'USDT', 6)
export const HUSD = createERC20Tokens('HUSD_ADDRESS', 'Huobi USD', 'HUSD', 6)
export const BUSD = createERC20Tokens('BUSD_ADDRESS', 'Huobi USD', 'BUSD', 6)
export const COMP = createERC20Tokens('COMP_ADDRESS', 'Compound', 'COMP', 18)
export const MKR = createERC20Tokens('MKR_ADDRESS', 'Maker', 'MKR', 18)
export const MSKA = createERC20Tokens('MSKA_ADDRESS', 'Mask A', 'MSKA', 18)
export const MSKB = createERC20Tokens('MSKB_ADDRESS', 'Mask B', 'MSKB', 18)
export const MSKC = createERC20Tokens('MSKC_ADDRESS', 'Mask C', 'MSKC', 18)
export const MSKD = createERC20Tokens('MSKD_ADDRESS', 'Mask D', 'MSKD', 18)
export const MSKE = createERC20Tokens('MSKE_ADDRESS', 'Mask E', 'MSKE', 18)
export const DAI = createERC20Tokens('DAI_ADDRESS', 'Dai Stablecoin', 'DAI', 18)
export const AMPL = createERC20Tokens('AMPL_ADDRESS', 'Ampleforth', 'AMPL', 18)
export const OKB = createERC20Tokens('OKB_ADDRESS', 'Ampleforth', 'OKB', 18)
export const UST = createERC20Tokens('UST_ADDRESS', 'Wrapped UST Token', 'UST', 18)
export const EASY = createERC20Tokens('EASY_ADDRESS', 'EASY', 'EASY', 18)
export const eUSDC = createERC20Tokens('eUSDC_ADDRESS', 'Easy USDC', 'eUSDC', 18)
export const eUSDT = createERC20Tokens('eUSDT_ADDRESS', 'Easy USDT', 'eUSDT', 18)
export const eDAI = createERC20Tokens('eDAI_ADDRESS', 'Easy DAI', 'eDAI', 18)
export const sUSD = createERC20Tokens('sUSD_ADDRESS', 'Synth sUSD', 'sUSD', 18)
export const UNITOKEN = createERC20Tokens('UNITOKEN_ADDRESS', 'Uniswap', 'UNI', 18)
export const TT01 = createERC20Tokens('TT01_ADDRESS', 'Test Token 01', 'TT01', 18)
export const TT02 = createERC20Tokens('TT02_ADDRESS', 'Test Token 02', 'TT02', 18)
export const ETHER = createERC20Tokens('ETHER_ADDRESS', 'Ether', 'ETH', 18)
export const QUICK = createERC20Tokens('QUICK_ADDRESS', 'Quickswap', 'QUICK', 18)
export const WBTC = createERC20Tokens('WBTC_ADDRESS', 'Wrapped Bitcoin', 'WBTC', 18)
export const IGG = createERC20Tokens('IGG_ADDRESS', 'IG Gold', 'IGG', 18)
export const OM = createERC20Tokens('OM_ADDRESS', 'OM Token', 'OM', 18)
export const SUSHI = createERC20Tokens('SUSHI_ADDRESS', 'SushiToken', 'SUSHI', 18)
export const YAM = createERC20Tokens('YAM_ADDRESS', 'YAM', 'YAM', 18)
export const RUNE = createERC20Tokens('RUNE_ADDRESS', 'RUNE.ETH', 'RUNE', 18)
export const YFI = createERC20Tokens('YFI_ADDRESS', 'Yearn', 'YFI', 18)
export const BTCB = createERC20Tokens('BTCB_ADDRESS', 'Binance BTC', 'BTCB', 18)
export const CAKE = createERC20Tokens('CAKE_ADDRESS', 'PancakeSwap Token', 'CAKE', 18)
export const maUSDC = createERC20Tokens('maUSDC_ADDRESS', 'Matic Aave interest bearing USDC', 'maUSDC', 6)
export const NFTX = createERC20Tokens('NFTX_ADDRESS', 'NFTX', 'NFTX', 18)
export const STETH = createERC20Tokens('stETH_ADDRESS', 'stakedETH', 'stETH', 18)

export const WNATIVE = createERC20Tokens(
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
}

export const BIPS_BASE = new BigNumber(10000)
export const ONE_BIPS = ONE.dividedBy(BIPS_BASE)

export const SLIPPAGE_MIN = 10 // bips
export const SLIPPAGE_DEFAULT = 50 // bips
export const SLIPPAGE_MAX = 1000 // bips

export const DEFAULT_TRANSACTION_DEADLINE = 30 /* minutes */ * 60 /* seconds */
export const L2_TRANSACTION_DEADLINE = 60 /* minutes */ * 5 /* seconds */

export const PRICE_IMPACT_LOW = 100 // 1%
export const PRICE_IMPACT_MEDIUM = 300 // 3%
export const PRICE_IMPACT_HIGH = 500 // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN = 1000 // 10%
// for non expert mode disable swaps above this
export const PRICE_IMPACT_NON_EXPERT_BLOCKED = 1500 // 15%

export const MINIMUM_AMOUNT = new BigNumber('1e-6')
