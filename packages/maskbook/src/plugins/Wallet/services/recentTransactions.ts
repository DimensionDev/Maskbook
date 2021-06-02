import { isSameAddress, TransactionStatusType } from '@dimensiondev/web3-shared'
import { createTransaction } from '../../../database/helpers/openDB'
import { getTransactionReceipt } from '../../../extension/background-script/EthereumService'
import { createWalletDBAccess } from '../database/Wallet.db'
import { currentChainIdSettings } from '../settings'

const MAX_RECENT_TRANSACTIONS_SIZE = 5

export async function getRecentTransactions(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('TransactionChunk')
    const chunks = await t.objectStore('TransactionChunk').getAll()
    return (
        chunks.find((x) => isSameAddress(x.address, address))?.transactions.slice(0, MAX_RECENT_TRANSACTIONS_SIZE) ?? []
    )
}

export async function updateTransactions(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('TransactionChunk')
    const store = t.objectStore('TransactionChunk')
    for await (const cursor of store) {
        if (!isSameAddress(cursor.value.address, address)) continue

        let modified = false
        const transactions = cursor.value.transactions
        for (const transaction of transactions) {
            if (transaction.status !== TransactionStatusType.NOT_DEPEND) continue
            try {
                const receipt = await getTransactionReceipt(transaction.hash)
                if (!receipt) continue
                transaction.status = receipt.status ? TransactionStatusType.SUCCEED : TransactionStatusType.FAILED
                modified = true
            } catch (e) {
                continue
            }
        }
        if (modified)
            await cursor.update({
                ...cursor.value,
                transactions,
            })
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
    const recordId = `${chainId}_${address}`

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
