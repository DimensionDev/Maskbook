import BigNumber from 'bignumber.js'
import { createERC20Token, getConstant } from '../../../web3/helpers'
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

    // token
    UST_ADDRESS: {
        [ChainId.Mainnet]: '0xa47c8bf37f92aBed4A126BDA807A7b7498661acD',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
    },
}

export const UST = createERC20Token(
    ChainId.Mainnet,
    getConstant(TRADE_CONSTANTS, 'UST_ADDRESS'),
    18,
    'Wrapped UST Token',
    'UST',
)

export const BIPS_BASE = new BigNumber(10000)
export const ONE_BIPS = new BigNumber(1).dividedBy(BIPS_BASE)

export const SLIPPAGE_TOLERANCE_MIN = 10 // bips
export const SLIPPAGE_TOLERANCE_DEFAULT = 50 // bips
export const SLIPPAGE_TOLERANCE_MAX = 500 // bips
