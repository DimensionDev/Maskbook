import type { TradeProvider } from '@masknet/public-api'
import type { Trade as V2Trade } from '@uniswap/v2-sdk'
import type { Trade as V3Trade } from '@uniswap/v3-sdk'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainIdOptionalRecord, ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { Token, Currency, TradeType } from '@uniswap/sdk-core'
import type { BigNumber } from 'bignumber.js'
import type { PartialRequired } from '@masknet/shared-base'

export interface ERC20TokenTable {
    [tokenAddress: string]: Array<FungibleToken<ChainId, SchemaType.ERC20>>
}

export type ERC20TokenCustomizedBase = Readonly<ChainIdOptionalRecord<ERC20TokenTable>>

export type ERC20AgainstToken = Readonly<ChainIdOptionalRecord<Array<FungibleToken<ChainId, SchemaType.ERC20>>>>

export interface TradeContext {
    TYPE: TradeProvider
    IS_UNISWAP_V2_LIKE?: boolean
    IS_UNISWAP_V3_LIKE?: boolean
    GRAPH_API?: string
    INIT_CODE_HASH?: string
    ROUTER_CONTRACT_ADDRESS?: string
    FACTORY_CONTRACT_ADDRESS?: string
    SPENDER_CONTRACT_ADDRESS?: string
    ADDITIONAL_TOKENS?: ChainIdOptionalRecord<Record<string, Web3Helper.FungibleTokenAll[]>>
    AGAINST_TOKENS?: ChainIdOptionalRecord<Web3Helper.FungibleTokenAll[]>
    CUSTOM_TOKENS?: ChainIdOptionalRecord<Record<string, Web3Helper.FungibleTokenAll[]>>
}

// #region types
// [target, gasLimit, callData]
export type Call = [string, number, string]

export type TokenPair = [Token, Token]

export enum PairState {
    NOT_EXISTS = 0,
    EXISTS = 1,
    INVALID = 2,
}

export type Trade = V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType>

export enum TradeStrategy {
    ExactIn = 0,
    ExactOut = 1,
}

export interface TradeComputed<T = unknown> {
    strategy: TradeStrategy
    inputToken?: Web3Helper.FungibleTokenAll
    outputToken?: Web3Helper.FungibleTokenAll
    inputAmount: BigNumber
    outputAmount: BigNumber
    executionPrice: BigNumber
    priceImpact: BigNumber
    maximumSold: BigNumber
    minimumReceived: BigNumber
    fee: BigNumber
    path?: Array<
        Array<
            | PartialRequired<Web3Helper.FungibleTokenAll, 'address'>
            | PartialRequired<Web3Helper.FungibleTokenAll, 'address'>
        >
    >
    trade_?: T
}

export interface SwapCall {
    address: string
    calldata: string
    value: string
}

export interface SwapCallEstimate {
    call: SwapCall
}

export interface SuccessfulCall extends SwapCallEstimate {
    call: SwapCall
    gasEstimate: BigNumber
}

export interface FailedCall extends SwapCallEstimate {
    call: SwapCall
    error: Error
}

export enum PoolState {
    LOADING = 0,
    NOT_EXISTS = 1,
    EXISTS = 2,
    INVALID = 3,
}

export namespace TraderAPI {
    export interface TradeInfo {
        value: TradeComputed | null
        provider: TradeProvider
        error?: Error
        gas?: string
        finalPrice?: BigNumber.Value
    }
    export interface Provider {
        provider: TradeProvider
        getTradeInfo: (
            chainId: ChainId,
            account: string,
            inputAmount_: string,
            slippage: number,
            inputToken?: Web3Helper.FungibleTokenAll,
            outputToken?: Web3Helper.FungibleTokenAll,
        ) => Promise<TradeInfo | null>

        getNativeWrapperTradeInfo: (
            chainId: ChainId,
            account: string,
            inputAmount: string,
            inputToken?: Web3Helper.FungibleTokenAll,
            outputToken?: Web3Helper.FungibleTokenAll,
        ) => Promise<TradeInfo | null>
    }
}
