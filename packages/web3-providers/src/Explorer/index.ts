import urlcat from 'urlcat'
import type { Transaction } from './types.js'
import { toTransaction } from './helpers.js'
import type { ExplorerAPI } from '../entry-types.js'

export class NativeExplorerAPI implements ExplorerAPI.Provider {
    async getLatestTransactions(
        account: string,
        url: string,
        { offset = 10, apikey }: ExplorerAPI.PageInfo = {},
    ): Promise<ExplorerAPI.Transaction[]> {
        const response = await fetch(
            urlcat(url, {
                module: 'account',
                action: 'txlist',
                address: account.toLowerCase(),
                startBlock: 0,
                endblock: 999999999999,
                page: 1,
                offset,
                sort: 'desc',
                apikey,
            }),
        )
        const rawTransactions = (await response.json()) as {
            message: string
            result?: Transaction[]
            status: '0' | '1'
        }
        return rawTransactions.result?.map(toTransaction) ?? []
    }
}
