import { first } from 'lodash-unified'
import { Explorer } from '@masknet/web3-providers'
import { TransactionChecker, TransactionStatusType } from '@masknet/web3-shared-base'
import { ChainId, getExplorerConstants } from '@masknet/web3-shared-evm'

export class AccountChecker implements TransactionChecker<ChainId> {
    static CHECK_TIMES = 30
    static CHECK_DELAY = 30 * 1000 // seconds
    static CHECK_LATEST_SIZE = 5

    async checkStatus(id: string, chainId: ChainId, account: string): Promise<TransactionStatusType> {
        const { API_KEYS = [], EXPLORER_API = '' } = getExplorerConstants(chainId)
        const latestTransactions = await Explorer.getLatestTransactions(account, EXPLORER_API, {
            offset: AccountChecker.CHECK_LATEST_SIZE,
            apikey: first(API_KEYS),
        })
        const tx = latestTransactions.find((x) => x.hash === id)
        if (!tx) return TransactionStatusType.NOT_DEPEND
        return tx.status === '0' ? TransactionStatusType.SUCCEED : TransactionStatusType.FAILED
    }
}
