import urlcat from 'urlcat'
import { last } from 'lodash-es'
import { createPageable, createIndicator, type Pageable, createNextIndicator, EMPTY_LIST } from '@masknet/shared-base'
import { type Transaction } from '@masknet/web3-shared-base'
import { ChainId, getDeBankConstants, type SchemaType } from '@masknet/web3-shared-evm'
import { formatTransactions, resolveDeBankAssetIdReversed } from '../helpers.js'
import type { HistoryRecord } from '../types.js'
import { DEBANK_OPEN_API } from '../constants.js'
import { fetchJSON } from '../../entry-helpers.js'
import type { HistoryAPI, HubOptions_Base } from '../../entry-types.js'

export class DeBankHistoryAPI implements HistoryAPI.Provider<ChainId, SchemaType> {
    async getTransactions(
        address: string,
        { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions_Base<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const { CHAIN_ID = '' } = getDeBankConstants(chainId)
        if (!CHAIN_ID) return createPageable(EMPTY_LIST, createIndicator(indicator))

        const result = await fetchJSON<HistoryRecord>(
            urlcat(DEBANK_OPEN_API, '/v1/user/history_list', {
                id: address.toLowerCase(),
                chain_id: resolveDeBankAssetIdReversed(CHAIN_ID),
                page_count: size,
                start_time: indicator?.id,
            }),
            undefined,
            {
                enableSquash: true,
            },
        )
        const transactions = formatTransactions(result)
        const timeStamp = last(result.history_list)?.time_at
        return createPageable(
            transactions,
            createIndicator(indicator),
            transactions.length > 0 ? createNextIndicator(indicator, timeStamp?.toString()) : undefined,
        )
    }

    async getAllTransactions(
        address: string,
        { indicator, size = 20 }: HubOptions_Base<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const result = await fetchJSON<HistoryRecord>(
            urlcat(DEBANK_OPEN_API, '/v1/user/all_history_list', {
                id: address.toLowerCase(),
                page_count: size,
                start_time: indicator?.id,
                // There are more chains on https://docs.cloud.debank.com/en/readme/api-pro-reference/chain#returns-1
                // but we only list these major chains that debank using in profile page.
                chain_ids: 'eth,aurora,matic,pls,ftm,op,klay,nova',
            }),
            undefined,
            {
                enableSquash: true,
            },
        )
        const transactions = formatTransactions(result)
        const timeStamp = last(result.history_list)?.time_at
        return createPageable(
            transactions,
            createIndicator(indicator),
            transactions.length > 0 ? createNextIndicator(indicator, timeStamp?.toString()) : undefined,
        )
    }
}
