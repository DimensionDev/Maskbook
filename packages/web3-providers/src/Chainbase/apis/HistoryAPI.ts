import urlcat from 'urlcat'
import { type Transaction } from '@masknet/web3-shared-base'
import { createIndicator, createNextIndicator, createPageable, type Pageable, EMPTY_LIST } from '@masknet/shared-base'
import { ChainId, isValidChainId, type SchemaType } from '@masknet/web3-shared-evm'
import type { Tx } from '../types.js'
import { fetchFromChainbase } from '../helpers.js'
import type { HistoryAPI, HubOptions_Base } from '../../entry-types.js'

export class ChainbaseHistoryAPI implements HistoryAPI.Provider<ChainId, SchemaType> {
    createTransactionFromTx(chainId: ChainId, tx: Tx): Transaction<ChainId, SchemaType> {
        return {
            id: tx.transaction_hash,
            chainId,
            status: tx.status,
            timestamp: new Date(tx.block_timestamp).getTime(),
            from: tx.from_address,
            to: tx.to_address,
            tokens: EMPTY_LIST,
        }
    }

    async getTransactions(
        address: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions_Base<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const txs = await fetchFromChainbase<Tx[]>(
            urlcat('/v1/account/txs', {
                chainId,
                address,
                page: (indicator?.index ?? 0) + 1,
            }),
        )

        if (!txs) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const assets = txs.map((x) => this.createTransactionFromTx(chainId, x))
        return createPageable(
            assets,
            createIndicator(indicator),
            assets.length ? createNextIndicator(indicator) : undefined,
        )
    }
}
