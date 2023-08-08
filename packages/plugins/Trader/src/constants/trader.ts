import { ONE } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { BigNumber } from 'bignumber.js'

export const MIN_GAS_LIMIT = '150000'
export const MIN_SLIPPAGE = 50 // 0.5%
export const MAX_SLIPPAGE = 500 // 5%

export const BIPS_BASE = new BigNumber(10000)
export const ONE_BIPS = ONE.dividedBy(BIPS_BASE)

export const SLIPPAGE_MIN = 10 // bips
export const SLIPPAGE_DEFAULT = 50 // bips
export const SLIPPAGE_MAX = 2000 // bips

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

export const BLOCK_TIME_SCALE: Partial<Record<ChainId, number>> = {
    [ChainId.Mainnet]: 3,
    [ChainId.Ropsten]: 3,
    [ChainId.Rinkeby]: 3,
    [ChainId.Gorli]: 3,
    [ChainId.Kovan]: 3,
    [ChainId.BSC]: 6,
    [ChainId.BSCT]: 6,
    [ChainId.Matic]: 6,
    [ChainId.Mumbai]: 6,
    [ChainId.Arbitrum]: 6,
    [ChainId.Arbitrum_Rinkeby]: 6,
    [ChainId.xDai]: 6,
    [ChainId.Avalanche]: 6,
    [ChainId.Avalanche_Fuji]: 6,
    [ChainId.Celo]: 6,
    [ChainId.Fantom]: 6,
    [ChainId.Aurora]: 6,
    [ChainId.Aurora_Testnet]: 6,
    [ChainId.Fuse]: 6,
    [ChainId.Boba]: 6,
    [ChainId.Metis]: 6,
    [ChainId.Optimism]: 6,
    [ChainId.Optimism_Kovan]: 6,
    [ChainId.Optimism_Goerli]: 6,
    [ChainId.Conflux]: 6,
    [ChainId.Astar]: 6,
    [ChainId.ZKSync_Alpha_Testnet]: 6,
    [ChainId.Crossbell]: 6,
    [ChainId.Moonbeam]: 6,
    [ChainId.Invalid]: 0,
}
