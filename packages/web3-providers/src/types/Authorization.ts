import type { NonFungibleContractSpender, FungibleTokenSpender } from '@masknet/web3-shared-base'
import type { SchemaType } from '@masknet/web3-shared-evm'

export namespace AuthorizationAPI {
    export interface Provider<ChainId> {
        getFungibleTokenSpenders?: (
            chainId: ChainId,
            account: string,
        ) => Promise<Array<FungibleTokenSpender<ChainId, SchemaType>>>

        getNonFungibleTokenSpenders?: (
            chainId: ChainId,
            account: string,
        ) => Promise<Array<NonFungibleContractSpender<ChainId, SchemaType>>>
    }
}
