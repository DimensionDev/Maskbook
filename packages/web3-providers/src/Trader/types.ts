import type { TradeProvider } from '@masknet/public-api'
import type { Trade as V2Trade } from '@uniswap/v2-sdk'
import type { Trade as V3Trade } from '@uniswap/v3-sdk'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainIdOptionalRecord, ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { Token, Currency, TradeType } from '@uniswap/sdk-core'

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
