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
        { chainId = ChainId.Mainnet, indicator }: HubOptions_Base<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const { CHAIN_ID = '' } = getDeBankConstants(chainId)
        if (!CHAIN_ID) return createPageable(EMPTY_LIST, createIndicator(indicator))

        const result = await fetchJSON<HistoryRecord>(
            urlcat(DEBANK_OPEN_API, '/v1/user/history_list', {
                id: address.toLowerCase(),
                chain_id: resolveDeBankAssetIdReversed(CHAIN_ID),
                page_count: 20,
                start_time: indicator?.id,
            }),
            undefined,
            {
                enableSquash: true,
            },
        )
        const transactions = formatTransactions(chainId, result)
        const timeStamp = last(transactions)?.timestamp
        return createPageable(
            transactions,
            createIndicator(indicator),
            transactions.length > 0 ? createNextIndicator(indicator, timeStamp?.toString()) : undefined,
        )
    }
}
