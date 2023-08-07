import { EMPTY_LIST } from '@masknet/shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-bitcoin'
import type { FungibleToken, NonFungibleToken } from '@masknet/web3-shared-base'
import type { TokenListAPI } from '../../../entry-types.js'

export class BitcoinFungibleTokenListAPI implements TokenListAPI.Provider<ChainId, SchemaType> {
    async getFungibleTokenList(chainId: ChainId, urls?: string[]): Promise<Array<FungibleToken<ChainId, SchemaType>>> {
        return EMPTY_LIST
    }

    async getNonFungibleTokenList(
        chainId: ChainId,
        urls?: string[],
    ): Promise<Array<NonFungibleToken<ChainId, SchemaType>>> {
        return EMPTY_LIST
    }
}
