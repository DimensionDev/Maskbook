import type { WyvernSchemaName } from 'opensea-js/lib/types'
import type { SourceType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/plugin-infra/web3'

export interface CollectibleJSON_Payload {
    chain_id: Web3Helper.ChainIdAll
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
    chainId: Web3Helper.ChainIdAll
    tokenId: string
    contractAddress: string
    schemaName?: WyvernSchemaName
    provider?: SourceType
}
