import BigNumber from 'bignumber.js'
import { ChainId } from '../../../web3/types'

export const TRADE_CONSTANTS = {
    // contracts
    ROUTER_V2_ADDRESS: {
        [ChainId.Mainnet]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Ropsten]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Rinkeby]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Kovan]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Gorli]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    },
}

export const MIN_SLIPPAGE_TOLERANCE = 10 // bips
export const DEFAULT_SLIPPAGE_TOLERANCE = 50 // bips
export const MAX_SLIPPAGE_TOLERANCE = 500 // bips

export const BIPS_BASE = new BigNumber(10000)
export const ONE_BIPS = new BigNumber(1).dividedBy(BIPS_BASE)

export const ALLOWED_PRICE_IMPACT_LOW = new BigNumber(100).multipliedBy(BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM = new BigNumber(300).multipliedBy(BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH = new BigNumber(500).multipliedBy(BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN = new BigNumber(1000).multipliedBy(BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT = new BigNumber(1500).multipliedBy(BIPS_BASE) // 15%
