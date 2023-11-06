import urlcat from 'urlcat'
import { type ChainId, EtherscanURL } from '@masknet/web3-shared-evm'
import type { Transaction } from '../types.js'
import { toTransaction } from '../helpers.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import type { ExplorerAPI } from '../../entry-types.js'

export class EtherscanExplorer {
    static async getLatestTransactions(
        chainId: ChainId,
        account: string,
        { offset = 10 }: ExplorerAPI.Options = {},
    ): Promise<ExplorerAPI.Transaction[]> {
        const { result: transactions = [] } = await fetchJSON<{
            message: string
            result?: Transaction[]
            status: '0' | '1'
        }>(
            urlcat(EtherscanURL.from(chainId), {
                chain_id: chainId,
                module: 'account',
                action: 'txlist',
                address: account.toLowerCase(),
                startBlock: 0,
                endblock: 999999999999,
                page: 1,
                offset,
                sort: 'desc',
            }),
        )
        return transactions.map(toTransaction)
    }
}
