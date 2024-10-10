// cspell:disable
import type { FungibleToken } from '@masknet/web3-shared-base'
import { ChainId, type ChainIdOptionalRecord, type SchemaType } from '../types/index.js'
import { createERC20Tokens } from '../helpers/token.js'
import { CHAIN_DESCRIPTORS } from './descriptors.js'

export type ERC20AgainstToken = Readonly<ChainIdOptionalRecord<Array<FungibleToken<ChainId, SchemaType.ERC20>>>>

export const APE = createERC20Tokens('APE_ADDRESS', 'ApeCoin', 'APE', 18)
export const USDC = createERC20Tokens('USDC_ADDRESS', 'USC Coin', 'USDC', 6)
export const USDCe = createERC20Tokens('USDC_ADDRESS', 'USD Coin', 'USDCe', 6)
export const USDT = createERC20Tokens('USDT_ADDRESS', 'Tether USD', 'USDT', 6)
export const USDTe = createERC20Tokens('USDT_ADDRESS', 'Tether USD', 'USDT.e', 6)
export const fUSDT = createERC20Tokens('fUSDT_ADDRESS', 'Frapped USDT', 'fUSDT', 6)
export const HUSD = createERC20Tokens('HUSD_ADDRESS', 'Huobi USD', 'HUSD', 6)
export const BUSD = createERC20Tokens('BUSD_ADDRESS', 'Huobi USD', 'BUSD', 6)
export const COMP = createERC20Tokens('COMP_ADDRESS', 'Compound', 'COMP', 18)
export const MKR = createERC20Tokens('MKR_ADDRESS', 'Maker', 'MKR', 18)
export const DAI = createERC20Tokens('DAI_ADDRESS', 'Dai Stablecoin', 'DAI', 18)
export const DAIe = createERC20Tokens('DAI_ADDRESS', 'Dai Stablecoin', 'DAI.e', 18)
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
export const TATR = createERC20Tokens('TART_ADDRESS', 'TATR tech', 'TATR', 18)
export const ETHER = createERC20Tokens('ETHER_ADDRESS', 'Ether', 'ETH', 18)
export const QUICK = createERC20Tokens('QUICK_ADDRESS', 'Quickswap', 'QUICK', 18)
export const WANNA = createERC20Tokens('WANNA_ADDRESS', 'Wannaswap', 'WANNA', 18)
export const WBTC = createERC20Tokens('WBTC_ADDRESS', 'Wrapped Bitcoin', 'WBTC', 18)
export const WBTCe = createERC20Tokens('WBTC_ADDRESS', 'Wrapped Bitcoin', 'WBTCe', 18)
export const IGG = createERC20Tokens('IGG_ADDRESS', 'IG Gold', 'IGG', 18)
export const OM = createERC20Tokens('OM_ADDRESS', 'OM Token', 'OM', 18)
export const SUSHI = createERC20Tokens('SUSHI_ADDRESS', 'SushiToken', 'SUSHI', 18)
export const RUNE = createERC20Tokens('RUNE_ADDRESS', 'RUNE.ETH', 'RUNE', 18)
export const YFI = createERC20Tokens('YFI_ADDRESS', 'Yearn', 'YFI', 18)
export const BTCB = createERC20Tokens('BTCB_ADDRESS', 'Binance BTC', 'BTCB', 18)
export const CAKE = createERC20Tokens('CAKE_ADDRESS', 'PancakeSwap Token', 'CAKE', 18)
export const maUSDC = createERC20Tokens('maUSDC_ADDRESS', 'Polygon Aave interest bearing USDC', 'maUSDC', 6)
export const NFTX = createERC20Tokens('NFTX_ADDRESS', 'NFTX', 'NFTX', 18)
export const STETH = createERC20Tokens('stETH_ADDRESS', 'stakedETH', 'stETH', 18)
export const CUSD = createERC20Tokens('cUSD_ADDRESS', 'Celo Dollar', 'cUSD', 18)
export const CEUR = createERC20Tokens('cEUR_ADDRESS', 'Celo Euro', 'cEUR', 18)
export const JOE = createERC20Tokens('JOE_ADDRESS', 'JoeToken', 'JOE', 18)
export const PNG = createERC20Tokens('PNG_ADDRESS', 'Pangolin', 'PNG', 18)
export const VERSA = createERC20Tokens('VERSA_ADDRESS', 'Versa Finance', 'VERSA', 18)
export const VIPER = createERC20Tokens('VIPER_ADDRESS', 'Viper', 'VIPER', 18)
export const OPENX = createERC20Tokens('OPENX_ADDRESS', 'OpenSwap Token', 'OpenX', 18)
export const JEWEL = createERC20Tokens('JEWEL_ADDRESS', 'Jewels', 'JEWEL', 18)
export const YUMI = createERC20Tokens('YUMI_ADDRESS', 'YumiSwap Token', 'YUMI', 18)
export const xYUMI = createERC20Tokens('xYUMI_ADDRESS', 'Yumi Staking Token', 'xYUMI', 18)
export const OP = createERC20Tokens('OP_ADDRESS', 'Optimism', 'OP', 18)
export const RARI = createERC20Tokens('RARI_ADDRESS', 'Rarible', 'RARI', 18)

const getNativeCurrency = (chainId: ChainId) => {
    return CHAIN_DESCRIPTORS.find((x) => x.chainId === chainId)?.nativeCurrency
}

export const WNATIVE = createERC20Tokens(
    'WNATIVE_ADDRESS',
    (chainId) => `Wrapped ${getNativeCurrency(chainId)?.name ?? 'Ether'}`,
    (chainId) => `W${getNativeCurrency(chainId)?.symbol ?? 'ETH'}`,
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
    [ChainId.Polygon]: [WNATIVE[ChainId.Polygon]],
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
    [ChainId.Optimism]: [WNATIVE[ChainId.Optimism]],
    [ChainId.Optimism_Goerli]: [WNATIVE[ChainId.Optimism_Goerli]],
    [ChainId.Astar]: [WNATIVE[ChainId.Astar]],
    [ChainId.Scroll]: [WNATIVE[ChainId.Scroll]],
    [ChainId.XLayer]: [WNATIVE[ChainId.XLayer]],
    [ChainId.XLayer_Testnet]: [WNATIVE[ChainId.XLayer_Testnet]],
}
