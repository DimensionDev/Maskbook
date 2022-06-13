import { first } from 'lodash-unified'
import { Explorer } from '@masknet/web3-providers'
import { TransactionChecker, TransactionStatusType } from '@masknet/web3-shared-base'
import { ChainId, getExplorerConstants } from '@masknet/web3-shared-evm'

/**
 * Fetch latest tx list of the the given account. It creates a signature for each transaction.
 * Treat two transactions the same with the identical transaction hash or signature.
 */
export class AccountChecker implements TransactionChecker<ChainId> {
    static CHECK_LATEST_TRANSACTION_SIZE = 5

    private async fetchLatestTransactions(chainId: ChainId, account: string) {
        const { API_KEYS = [], EXPLORER_API = '' } = getExplorerConstants(chainId)
        return Explorer.getLatestTransactions(account, EXPLORER_API, {
            offset: AccountChecker.CHECK_LATEST_TRANSACTION_SIZE,
            apikey: first(API_KEYS),
        })
    }

    async checkStatus(id: string, chainId: ChainId, account: string): Promise<TransactionStatusType> {
        const latestTransactions = await this.fetchLatestTransactions(chainId, account)
        const tx = latestTransactions.find((x) => x.hash === id)
        if (!tx) return TransactionStatusType.NOT_DEPEND
        // '1' for successful transactions and '0' for failed transactions.
        return tx.status === '1' ? TransactionStatusType.SUCCEED : TransactionStatusType.FAILED
    }
}
