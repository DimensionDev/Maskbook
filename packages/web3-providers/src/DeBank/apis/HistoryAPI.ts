import { EMPTY_LIST } from '@masknet/shared-base'
import {
    Transaction,
    createPageable,
    HubOptions,
    createIndicator,
    Pageable,
    createNextIndicator,
} from '@masknet/web3-shared-base'
import { ChainId, getDeBankConstants, SchemaType } from '@masknet/web3-shared-evm'
import { formatTransactions, resolveDeBankAssetIdReversed } from '../helpers.js'
import type { HistoryRecord } from '../types.js'
import { fetchJSON } from '../../entry-helpers.js'
import type { HistoryAPI } from '../../entry-types.js'
import urlcat from 'urlcat'
import { last } from 'lodash-es'

const DEBANK_OPEN_API = 'https://debank-proxy.r2d2.to'

export class DeBankHistoryAPI implements HistoryAPI.Provider<ChainId, SchemaType> {
    async getTransactions(
        address: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const { CHAIN_ID = '' } = getDeBankConstants(chainId)
        if (!CHAIN_ID) return createPageable(EMPTY_LIST, createIndicator(indicator))

        const result = await fetchJSON<HistoryRecord>(
            urlcat(`${DEBANK_OPEN_API}/v1/user/history_list`, {
                id: address.toLowerCase(),
                chain_id: resolveDeBankAssetIdReversed(CHAIN_ID),
                page_count: 20,
                start_time: indicator?.queryParam,
            }),
        )
        const transactions = formatTransactions(chainId, result)
        const timeStamp = last(transactions)?.timestamp
        return createPageable(
            transactions,
            createIndicator(indicator, undefined, timeStamp?.toString()),
            transactions.length > 0 ? createNextIndicator(indicator, undefined, timeStamp?.toString()) : undefined,
        )
    }
}
