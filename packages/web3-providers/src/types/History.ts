import type { Transaction, HubOptions, Pageable } from '@masknet/web3-shared-base'

export namespace HistoryAPI {
    export interface Provider<ChainId, SchemaType> {
        getTransactions(
            address: string,
            options?: HubOptions<ChainId>,
        ): Promise<Pageable<Transaction<ChainId, SchemaType>>>
    }
}
