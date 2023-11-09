import urlcat from 'urlcat'
import { type Transaction } from '@masknet/web3-shared-base'
import { createIndicator, createNextIndicator, createPageable, type Pageable, EMPTY_LIST } from '@masknet/shared-base'
import { ChainId, isValidChainId, type SchemaType } from '@masknet/web3-shared-evm'
import type { Tx } from '../types.js'
import { fetchFromChainbase, toTransaction } from '../helpers.js'
import type { HistoryAPI, BaseHubOptions } from '../../entry-types.js'

class ChainbaseHistoryAPI implements HistoryAPI.Provider<ChainId, SchemaType> {
    async getTransactions(
        address: string,
        { chainId = ChainId.Mainnet, indicator }: BaseHubOptions<ChainId> = {},
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
        const assets = txs.map((x) => toTransaction(chainId, x))
        return createPageable(
            assets,
            createIndicator(indicator),
            assets.length ? createNextIndicator(indicator) : undefined,
        )
    }
    async getTransaction(chain_id: number, hash: string, block_number?: number, tx_index?: number) {
        const url = urlcat('/v1/tx/detail', {
            chain_id,
            hash,
            block_number,
            tx_index,
        })
        return fetchFromChainbase<Tx>(url)
    }

    async getEventsByContract(
        contract_address: string,
        from_block: number,
        to_block: number | 'latest',
        { chainId = ChainId.Mainnet, indicator }: BaseHubOptions<ChainId> = {},
    ) {
        const url = urlcat('/v1/contract/events', {
            chain_id: chainId,
            contract_address,
            from_block,
            to_block,
            page: (indicator?.index ?? 0) + 1,
        })
        return fetchFromChainbase<Event>(url)
    }
}
export const ChainbaseHistory = new ChainbaseHistoryAPI()
