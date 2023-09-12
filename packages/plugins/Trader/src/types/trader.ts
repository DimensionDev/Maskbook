import type { FungibleToken } from '@masknet/web3-shared-base'
import type { ChainIdOptionalRecord, ChainId, SchemaType } from '@masknet/web3-shared-evm'

export interface ERC20TokenTable {
    [tokenAddress: string]: Array<FungibleToken<ChainId, SchemaType.ERC20>>
}

export type ERC20TokenCustomizedBase = Readonly<ChainIdOptionalRecord<ERC20TokenTable>>

export type ERC20AgainstToken = Readonly<ChainIdOptionalRecord<Array<FungibleToken<ChainId, SchemaType.ERC20>>>>

export enum WarningLevel {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    CONFIRMATION_REQUIRED = 4,
    BLOCKED = 5,
}

export enum ContentTab {
    Market = 'market',
    Price = 'price',
    Exchange = 'exchange',
    Swap = 'swap',
    NFTItems = 'nft-items',
}

export enum TokenPanel {
    Input = 0,
    Output = 1,
}
