import type {
    NonFungibleContractSpenderAuthorization,
    FungibleTokenSpenderAuthorization,
} from '@masknet/web3-shared-base'
import type { SchemaType } from '@masknet/web3-shared-evm'

export namespace AuthorizationAPI {
    export interface Provider<ChainId> {
        getApprovedNonFungibleContracts(
            chainId: ChainId,
            account: string,
        ): Promise<Array<NonFungibleContractSpenderAuthorization<ChainId, SchemaType>>>

        getApprovedFungibleTokenSpenders(
            chainId: ChainId,
            account: string,
        ): Promise<Array<FungibleTokenSpenderAuthorization<ChainId, SchemaType>>>
    }
}
