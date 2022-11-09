import type { WyvernSchemaName } from 'opensea-js/lib/types.js'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { SourceType } from '@masknet/web3-shared-base'

export interface CollectibleToken {
    chainId: ChainId
    tokenId: string
    contractAddress: string
    schemaName?: WyvernSchemaName
    sourceType?: SourceType
}
