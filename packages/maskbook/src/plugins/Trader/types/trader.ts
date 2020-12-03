import type BigNumber from 'bignumber.js'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'

export enum TradeProvider {
    UNISWAP,
    ZRX, // 0x
    // ONE_INCH,
    // SUSHISWAP,
}

// ZRX supported source swap list
// Learn more https://github.com/0xProject/0x-monorepo/blob/development/packages/asset-swapper/src/utils/market_operation_utils/types.ts#L27
export enum ZrxTradePool {
    ZRX = '0x',
    Native = 'Native',
    Mesh = 'Mesh',
    Uniswap = 'Uniswap',
    UniswapV2 = 'Uniswap_V2',
    Eth2Dai = 'Eth2Dai',
    Kyber = 'Kyber',
    Curve = 'Curve',
    LiquidityProvider = 'LiquidityProvider',
    MultiBridge = 'MultiBridge',
    Balancer = 'Balancer',
    Cream = 'CREAM',
    Bancor = 'Bancor',
    MStable = 'mStable',
    Mooniswap = 'Mooniswap',
    MultiHop = 'MultiHop',
    Shell = 'Shell',
    Swerve = 'Swerve',
    SnowSwap = 'SnowSwap',
    SushiSwap = 'SushiSwap',
    CryptoCom = 'CryptoCom',
    Dodo = 'DODO',
}

export interface TradeComputed<T = unknown> {
    strategy: TradeStrategy
    inputAmount: BigNumber
    outputAmount: BigNumber
    nextMidPrice: BigNumber
    executionPrice: BigNumber
    priceImpact: BigNumber
    maximumSold: BigNumber
    minimumReceived: BigNumber
    priceImpactWithoutFee: BigNumber
    fee: BigNumber
    path?: (EtherTokenDetailed | ERC20TokenDetailed)[]
    trade_?: T
}

export enum TradeStrategy {
    ExactIn,
    ExactOut,
}

export enum TokenPanelType {
    Input,
    Output,
}
