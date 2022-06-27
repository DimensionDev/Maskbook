import { sha3, toHex } from 'web3-utils'
import { first } from 'lodash-unified'
import { Explorer, ExplorerAPI } from '@masknet/web3-providers'
import { TransactionChecker, TransactionStatusType } from '@masknet/web3-shared-base'
import { ChainId, getExplorerConstants, Transaction } from '@masknet/web3-shared-evm'

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
 * Fetch latest tx list of the the given account. It creates a signature for each transaction.
 * Treat two transactions the same with the identical transaction hash or signature.
 */
export class AccountChecker implements TransactionChecker<ChainId, Transaction> {
    static CHECK_LATEST_TRANSACTION_SIZE = 5

    private ttl = new TTL<ExplorerAPI.Transaction[]>()

    private getExplorerTransactionId(transaction: ExplorerAPI.Transaction | null) {
        if (!transaction) return ''
        const { from, to, input, value } = transaction
        return sha3([from, to, input || '0x0', toHex(value || '0x0') || '0x0'].join('_')) ?? ''
    }

    private getTransactionId(transaction: Transaction) {
        const { from, to, data = '0x0', value = '0x0' } = transaction
        if (!from || !to) return ''
        return sha3([from, to, data, value].join('_')) ?? ''
    }

    private async fetchLatestTransactions(chainId: ChainId, account: string) {
        const key = `${chainId}_${account.toLowerCase}`
        const hit = this.ttl.get(key)
        if (hit) return hit

        const { API_KEYS = [], EXPLORER_API = '' } = getExplorerConstants(chainId)
        const transactions = await Explorer.getLatestTransactions(account, EXPLORER_API, {
            offset: AccountChecker.CHECK_LATEST_TRANSACTION_SIZE,
            apikey: first(API_KEYS),
        })
        this.ttl.set(key, transactions, 15 * 1000)
        return transactions
    }

    async getStatus(chainId: ChainId, id: string, transaction: Transaction): Promise<TransactionStatusType> {
        const account = transaction.from as string | undefined
        if (!account) throw new Error('Cannot found account.')
        const latestTransactions = await this.fetchLatestTransactions(chainId, account)
        const txId = this.getTransactionId(transaction)
        const tx = latestTransactions.find((x) => x.hash === id || this.getExplorerTransactionId(x) === txId)
        if (!tx) return TransactionStatusType.NOT_DEPEND
        // '1' for successful transactions and '0' for failed transactions.
        return tx.status === '1' ? TransactionStatusType.SUCCEED : TransactionStatusType.FAILED
    }
}
