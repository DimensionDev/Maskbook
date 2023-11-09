import type { Pageable } from '@masknet/shared-base'
import type { Transaction } from '@masknet/web3-shared-base'
import type { BaseHubOptions } from '../entry-types.js'

export namespace HistoryAPI {
    export enum TransactionType {
        SEND = 'Send',
        SWAP = 'swap',
        RECEIVE = 'Receive',
        TRANSFER = 'transfer',
        CREATE_LUCKY_DROP = 'create_lucky_drop',
        CREATE_RED_PACKET = 'create_red_packet',
        FILL_POOL = 'fill_pool',
        CLAIM = 'claim',
        WITHDRAW = 'withdraw',
        REFUND = 'refund',
    }

    export interface Provider<ChainId, SchemaType> {
        getTransactions(
            address: string,
            options?: BaseHubOptions<ChainId>,
        ): Promise<Pageable<Transaction<ChainId, SchemaType>>>
    }
}
