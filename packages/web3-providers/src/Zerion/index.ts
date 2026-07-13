import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import type { Transaction } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { compact } from 'lodash-es'
import urlcat from 'urlcat'
import type { BaseHubOptions } from '../entry-types.js'
import { formatRestTransaction } from './helpers.js'
import type { TransactionsResponse } from './reset-types.js'

const ZERION_REST_API = 'https://zerion-proxy.r2d2.to/'

class ZerionAPI {
    async getTransactions(
        address: string,
        { indicator, size = 20 }: BaseHubOptions<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const url = urlcat(ZERION_REST_API, '/v1/wallets/:address/transactions', {
            address,
            'page[after]': indicator?.id,
            'page[size]': size,
            'filter[trash]': 'only_non_trash',
        })
        const res = await fetchJSON<TransactionsResponse>(url)
        const transactions = compact(res.data.map((x) => formatRestTransaction(x)))
        let nextIndicator: PageIndicator | undefined
        if (res.links.next) {
            const url = new URL(res.links.next)
            const pageAfter = url ? url.searchParams.get('page[after]') : undefined
            nextIndicator = pageAfter ? createNextIndicator(indicator, pageAfter) : undefined
        }

        return createPageable(transactions, createIndicator(indicator), nextIndicator)
    }
}

export const Zerion = new ZerionAPI()
