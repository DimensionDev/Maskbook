import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainIdOptionalRecord, ChainId, SchemaType } from '@masknet/web3-shared-evm'

interface ERC20TokenTable {
    [tokenAddress: string]: Array<FungibleToken<ChainId, SchemaType.ERC20>>
}

export type ERC20TokenCustomizedBase = Readonly<ChainIdOptionalRecord<ERC20TokenTable>>

export type ERC20AgainstToken = Readonly<ChainIdOptionalRecord<Array<FungibleToken<ChainId, SchemaType.ERC20>>>>

export enum ContentTab {
    Market = 'market',
    Price = 'price',
    Exchange = 'exchange',
    NFTItems = 'nft-items',
}

export enum TokenPanel {
    Input = 0,
    Output = 1,
}

interface Token {
    chainId: number
    decimals: number
    contractAddress: string
    symbol: string
    logo: string | undefined
}

export interface OkxBaseTransaction {
    hash: string
    timestamp: number
}
export interface OkxSwapTransaction extends OkxBaseTransaction {
    kind: 'swap'
    chainId: number
    fromToken: Token
    fromTokenAmount: string | undefined
    toToken: Token
    toTokenAmount: string | undefined
    transactionFee: string
    gasLimit: string
    gasPrice: string
    dexContractAddress: string
    estimatedTime: number
}

export interface OkxBridgeTransaction extends OkxBaseTransaction {
    kind: 'bridge'
    fromChainId: number
    toChainId: number
    fromToken: Token
    fromTokenAmount: string | undefined
    toToken: Token
    toTokenAmount: string | undefined
    transactionFee: string
    gasLimit: string
    gasPrice: string
    dexContractAddress: string
    estimatedTime: number
}

export type OkxTransaction = OkxSwapTransaction | OkxBridgeTransaction
