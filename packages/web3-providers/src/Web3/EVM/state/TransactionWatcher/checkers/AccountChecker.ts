import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { type TransactionChecker, TransactionStatusType } from '@masknet/web3-shared-base'
import type { ChainId, Transaction } from '@masknet/web3-shared-evm'
import { EtherscanExplorer } from '../../../../../Etherscan/index.js'
import type { ExplorerAPI } from '../../../../../entry-types.js'

class TTL<T> {
    private cache: Record<string, { value: T; ttl: number; at: number }> = {}

    get(key: string): T | undefined {
        if (!this.cache[key]) return
        const { value, at, ttl } = this.cache[key]
        return Date.now() - at < ttl ? value : undefined
    }
    set(key: string, value: T, ttl = Number.MAX_SAFE_INTEGER) {
        this.cache[key] = {
            at: Date.now(),
            ttl,
            value,
        }
    }
}

/**
 * Fetch latest tx list of the given account. It creates a signature for each transaction.
 * Treat two transactions the same with the identical transaction hash or signature.
 */
class AccountCheckerAPI implements TransactionChecker<ChainId, Transaction> {
    static CHECK_LATEST_TRANSACTION_SIZE = 5

    private ttl = new TTL<ExplorerAPI.Transaction[]>()

    private getExplorerTransactionId(transaction: ExplorerAPI.Transaction | null) {
        if (!transaction) return ''
        const { from, to, input, value } = transaction
        return web3_utils.sha3([from, to, input || '0x0', web3_utils.toHex(value || '0x0') || '0x0'].join('_')) ?? ''
    }

    private getTransactionId(transaction: Transaction) {
        const { from, to, data = '0x0', value = '0x0' } = transaction
        if (!from || !to) return ''
        return web3_utils.sha3([from, to, data, value].join('_')) ?? ''
    }

    private async fetchLatestTransactions(chainId: ChainId, account: string) {
        const key = `${chainId}_${account.toLowerCase}`
        const hit = this.ttl.get(key)
        if (hit) return hit

        const transactions = await EtherscanExplorer.getLatestTransactions(chainId, account, {
            offset: AccountCheckerAPI.CHECK_LATEST_TRANSACTION_SIZE,
        })
        this.ttl.set(key, transactions, 15 * 1000)
        return transactions
    }

    async getStatus(chainId: ChainId, id: string, transaction: Transaction): Promise<TransactionStatusType> {
        const account = transaction.from
        if (!account) throw new Error('Cannot found account.')
        const latestTransactions = await this.fetchLatestTransactions(chainId, account)
        const txId = this.getTransactionId(transaction)
        const tx = latestTransactions.find((x) => x.hash === id || this.getExplorerTransactionId(x) === txId)
        if (!tx) return TransactionStatusType.NOT_DEPEND
        // '1' for successful transactions and '0' for failed transactions.
        return tx.status === '1' ? TransactionStatusType.SUCCEED : TransactionStatusType.FAILED
    }
}
export const EVMAccountChecker = new AccountCheckerAPI()
