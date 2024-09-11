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

interface SwapToken {
    chainId: number
    decimals: number
    contractAddress: string
    symbol: string
    logo: string | undefined
}
export interface OkxSwapTransaction {
    hash: string
    chainId: number
    fromToken: SwapToken
    fromTokenAmount: string | undefined
    toToken: SwapToken
    toTokenAmount: string | undefined
    datetime: number
    transactionFee: string
    gasLimit: string
    gasPrice: string
    dexContractAddress: string
    estimatedTime: number
}
