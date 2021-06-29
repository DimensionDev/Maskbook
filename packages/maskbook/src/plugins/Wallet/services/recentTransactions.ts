import { formatEthereumAddress, isSameAddress, TransactionStateType, TransactionStatusType } from '@masknet/web3-shared'
import { createTransaction } from '../../../database/helpers/openDB'
import { getTransactionReceipt } from '../../../extension/background-script/EthereumService'
import type { TransactionRecord } from '../database/types'
import { createWalletDBAccess } from '../database/Wallet.db'
import { currentChainIdSettings } from '../settings'
import { TransactionChunkRecordIntoDB, TransactionChunkRecordOutDB } from './helpers'

const MAX_RECENT_TRANSACTIONS_SIZE = 5

function getRecordId(address: string) {
    return `${currentChainIdSettings.value}_${formatEthereumAddress(address)}`
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
            .map((x) => getTransactionReceipt(x.hash)),
    )
    return transactions.map((x) => {
        const receipt = receipts.find((y) => y?.transactionHash === x.hash)
        if (!receipt) return x
        return {
            hash: receipt.transactionHash,
            status:
                (receipt.status as any) === '0x1' || receipt.status === true
                    ? TransactionStatusType.SUCCEED
                    : TransactionStateType.FAILED,
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
}

export async function clearRecentTransactions(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('TransactionChunk')
    for await (const x of t.objectStore('TransactionChunk').iterate()) {
        if (!isSameAddress(x.value.address, address)) continue
        x.delete()
    }
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
    const chunk = chunk_
        ? {
              ...chunk_,
              updatedAt: now,
              transactions: chunk_.transactions.concat(transactionIntoDB).slice(-MAX_RECENT_TRANSACTIONS_SIZE),
          }
        : {
              address,
              chain_id: chainId,
              record_id: recordId,
              createdAt: now,
              updatedAt: now,
              transactions: [transactionIntoDB],
          }

    // write the new transaction into DB
    await t.objectStore('TransactionChunk').put(chunk)
}
