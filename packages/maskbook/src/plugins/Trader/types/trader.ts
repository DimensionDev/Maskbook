import type BigNumber from 'bignumber.js'
import type { ChainId, FungibleTokenDetailed, NativeTokenDetailed, ERC20TokenDetailed } from '../../../web3/types'

export enum TradeProvider {
    UNISWAP,
    ZRX, // 0x
    // ONE_INCH,
    SUSHISWAP,
    SASHIMISWAP,
    BALANCER,
}

export enum WarningLevel {
    LOW = 1,
    MEDIUM,
    HIGH,
    CONFIRMATION_REQUIRED,
    BLOCKED,
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
    inputToken?: FungibleTokenDetailed
    outputToken?: FungibleTokenDetailed
    inputAmount: BigNumber
    outputAmount: BigNumber
    nextMidPrice: BigNumber
    executionPrice: BigNumber
    priceImpact: BigNumber
    maximumSold: BigNumber
    minimumReceived: BigNumber
    priceImpactWithoutFee: BigNumber
    fee: BigNumber
    path?: (PartialRequired<NativeTokenDetailed, 'address'> | PartialRequired<ERC20TokenDetailed, 'address'>)[][]
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

export interface TradeContext {
    GRAPH_API: string
    INIT_CODE_HASH: string
    ROUTER_CONTRACT_ADDRESS: string
    FACTORY_CONTRACT_ADDRESS: string
    AGAINST_TOKENS: {
        [key in ChainId]: ERC20TokenDetailed[]
    }
    CUSTOM_TOKENS: {
        [key in ChainId]?: {
            [key: string]: ERC20TokenDetailed[]
        }
    }
}
