import type { WyvernSchemaName } from 'opensea-js/lib/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { SourceType } from '@masknet/web3-shared-base'

export interface CollectibleJSON_Payload {
    chain_id: ChainId
    address: string
    token_id: string
    provider?: SourceType
}

export enum CollectibleTab {
    ABOUT = 0,
    DETAILS = 1,
    OFFERS = 2,
    ACTIVITY = 3,
}

export interface CollectibleToken {
    chainId: ChainId
    tokenId: string
    contractAddress: string
    schemaName?: WyvernSchemaName
    provider?: SourceType
}
