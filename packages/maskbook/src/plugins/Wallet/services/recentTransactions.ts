import { createTransaction } from '../../../database/helpers/openDB'
import { getChainId, getTransactionReceipt } from '../../../extension/background-script/EthereumService'
import { isSameAddress } from '../../../web3/helpers'
import { TransactionStatusType } from '../../../web3/types'
import type { TransactionRecord } from '../database/types'
import { createWalletDBAccess } from '../database/Wallet.db'
import { RecentTransactionRecordIntoDB } from './helpers'

const MAX_RECENT_TRANSACTIONS_SIZE = 5

export async function getRecentTransactions(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Transaction')
    const transactions = await t.objectStore('Transaction').getAll()
    return transactions
        .filter((x) => isSameAddress(x.address, address))
        .sort((a, z) => a.createdAt.getTime() - z.createdAt.getTime())
        .slice(0, MAX_RECENT_TRANSACTIONS_SIZE)
}

export async function updateTransactions(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Transaction', 'Wallet')
    for await (const x of t.objectStore('Transaction').iterate()) {
        if (!isSameAddress(x.value.address, address)) continue
        if (x.value.status !== TransactionStatusType.NOT_DEPEND) continue
        try {
            const receipt = await getTransactionReceipt(x.value.hash)
            if (!receipt) continue
            x.update({
                ...x.value,
                status: receipt.status ? TransactionStatusType.SUCCEED : TransactionStatusType.FAILED,
                updatedAt: new Date(),
            })
        } catch (e) {
            continue
        }
    }
}

export async function clearRecentTransactions(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Transaction', 'Wallet')
    for await (const x of t.objectStore('Transaction').iterate()) {
        if (!isSameAddress(x.value.address, address)) continue
        x.delete()
    }
}

export async function addRecentTransaction(
    transaction: PartialRequired<TransactionRecord, 'address' | 'hash' | 'description'>,
) {
    const now = new Date()
    const { address } = transaction
    const chainId = await getChainId()
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Transaction', 'Wallet')

    // write the new transaction into DB
    await t.objectStore('Transaction').put(
        RecentTransactionRecordIntoDB({
            ...transaction,
            chain_id: chainId,
            createdAt: now,
            updatedAt: now,
            status: TransactionStatusType.NOT_DEPEND,
        }),
    )

    // clear the eldest transactions
    for await (const x of t.objectStore('Transaction').iterate()) {
        if (!isSameAddress(x.value.address, address)) continue
        // TODO
    }
}
