import { ONE } from '@masknet/web3-shared-base'
import BigNumber from 'bignumber.js'

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
