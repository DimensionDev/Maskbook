import type { Transaction, HubOptions } from '@masknet/web3-shared-base'

export namespace HistoryAPI {
    export interface Provider<ChainId, SchemaType> {
        getTransactions(
            address: string,
            options?: HubOptions<ChainId>,
        ): Promise<Array<Transaction<ChainId, SchemaType>>>
    }
}
