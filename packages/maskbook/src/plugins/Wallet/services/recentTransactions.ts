import { WalletMessages } from '@masknet/plugin-wallet'
import { formatEthereumAddress, isSameAddress, TransactionStatusType } from '@masknet/web3-shared'
import type { TransactionReceipt } from 'web3-core'
import { createTransaction } from '../../../database/helpers/openDB'
import { getTransactionReceipt } from '../../../extension/background-script/EthereumService'
import { memoizePromise } from '../../../utils'
import type { TransactionRecord } from '../database/types'
import { createWalletDBAccess } from '../database/Wallet.db'
import { currentChainIdSettings } from '../settings'
import { TransactionChunkRecordIntoDB, TransactionChunkRecordOutDB } from './helpers'

const MAX_RECENT_TRANSACTIONS_SIZE = 10
const getTransactionReceiptWithCache = memoizePromise(getTransactionReceipt, (hash: string) => hash)

function getRecordId(address: string) {
    return `${currentChainIdSettings.value}_${formatEthereumAddress(address)}`
}

function getReceiptStatus(receipt: TransactionReceipt | null) {
    if (!receipt) return TransactionStatusType.NOT_DEPEND
    const status = receipt.status as unknown as string
    if (receipt.status === false || ['0x', '0x0'].includes(status)) return TransactionStatusType.FAILED
    if (receipt.status === true || ['0x1'].includes(status)) return TransactionStatusType.SUCCEED
    return TransactionStatusType.NOT_DEPEND
}

export async function getRecentTransactionsFromDB(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('TransactionChunk')
    const chunk = await t.objectStore('TransactionChunk').get(getRecordId(address))
    if (!chunk) return []
    return chunk.transactions.slice(0, MAX_RECENT_TRANSACTIONS_SIZE).reverse() ?? []
}

export async function getRecentTransactionsFromChain(address: string) {
    const transactions = await getRecentTransactionsFromDB(address)
    const receipts = await Promise.all(
        transactions
            .filter((x) => x.status === TransactionStatusType.NOT_DEPEND)
            .map((x) => getTransactionReceiptWithCache(x.hash)),
    )

    // if the status is not depend, then clean the cache in order to fetch receipt again in the next round
    transactions.forEach((x, i) => {
        const receipt = receipts[i]
        if (!receipt || getReceiptStatus(receipt) !== TransactionStatusType.NOT_DEPEND)
            getTransactionReceiptWithCache.cache.delete(x.hash)
    })
    return transactions.map((x) => {
        const receipt = receipts.find((y) => y?.transactionHash === x.hash)
        if (!receipt) return x
        return {
            hash: receipt.transactionHash,
            status: getReceiptStatus(receipt),
        }
    }) as TransactionRecord[]
}

export async function updateTransactions(updates: Map<string, TransactionRecord[]>) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('TransactionChunk')
    const store = t.objectStore('TransactionChunk')
    for await (const cursor of store) {
        const chunk = cursor.value
        const updates_ = updates.get(formatEthereumAddress(chunk.address))
        if (!updates_) continue
        await cursor.update(
            TransactionChunkRecordIntoDB({
                ...TransactionChunkRecordOutDB(chunk),
                transactions: chunk.transactions.map((x) => ({
                    ...x,
                    ...updates_.find((y) => y.hash === x.hash),
                })),
            }),
        )
    }
    WalletMessages.events.transactionsUpdated.sendToAll(undefined)
}

export async function clearRecentTransactions(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('TransactionChunk')
    for await (const x of t.objectStore('TransactionChunk').iterate()) {
        if (!isSameAddress(x.value.address, address)) continue
        x.delete()
    }
    getTransactionReceiptWithCache.cache.clear()
    WalletMessages.events.transactionsUpdated.sendToAll(undefined)
}

export async function addRecentTransaction(address: string, hash: string) {
    const now = new Date()
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('TransactionChunk')

    const chainId = currentChainIdSettings.value
    const recordId = getRecordId(address)

    // compose transaction record
    const transactionIntoDB = {
        hash,
        status: TransactionStatusType.NOT_DEPEND,
    }

    // compose chunk record
    const chunk_ = await t.objectStore('TransactionChunk').get(recordId)
    const transactions = chunk_?.transactions.concat(transactionIntoDB) ?? []
    const chunk = chunk_
        ? {
              ...chunk_,
              updatedAt: now,
              // if the new transaction list is over the max size, then remove the overflow part
              transactions: transactions.slice(-MAX_RECENT_TRANSACTIONS_SIZE),
          }
        : {
              address,
              chain_id: chainId,
              record_id: recordId,
              createdAt: now,
              updatedAt: now,
              transactions: [transactionIntoDB],
          }

    // we also need to remove overflow transactions from the cache
    transactions
        .slice(0, -MAX_RECENT_TRANSACTIONS_SIZE)
        .forEach((x) => getTransactionReceiptWithCache.cache.delete(x.hash))

    // write the new transaction into DB
    await t.objectStore('TransactionChunk').put(chunk)
    WalletMessages.events.transactionsUpdated.sendToAll(undefined)
}
