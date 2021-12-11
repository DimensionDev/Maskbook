import urlcat from 'urlcat'
import { toTransaction } from './helpers'
import type { Transaction } from './types'

export async function getLatestTransactions(
    account: string,
    url: string,
    {
        offset = 10,
        apikey,
    }: Partial<{
        offset?: number
        apikey?: string
    }> = {},
) {
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
