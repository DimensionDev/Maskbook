import { WalletMessages } from '@masknet/plugin-wallet'
import {
    ChainId,
    EthereumTransactionConfig,
    formatEthereumAddress,
    TransactionStatusType,
} from '@masknet/web3-shared-evm'
import { currentChainIdSettings } from '../../settings'
import { PluginDB } from '../../database/Plugin.db'

export const DB_TYPE = 'recent-transactions-v2'
export const MAX_RECENT_TRANSACTIONS_SIZE = 20

export interface RecentTransaction {
    at: Date
    hash: string
    status: TransactionStatusType
    candidates: Record<string, EthereumTransactionConfig>
}

export interface RecentTransactionChunk {
    id: string // chainId + address
    chainId: ChainId
    address: string
    type: typeof DB_TYPE
    transactions: RecentTransaction[]
    createdAt: Date
    updatedAt: Date
}

function getRecordId(chainId: ChainId, address: string) {
    return `${chainId}_${formatEthereumAddress(address)}`
}

export async function addRecentTransaction(
    chainId: ChainId,
    address: string,
    hash: string,
    config: EthereumTransactionConfig,
) {
    const now = new Date()
    const recordId = getRecordId(chainId, address)
    const chunk = await PluginDB.get(DB_TYPE, recordId)
    await PluginDB.add({
        type: DB_TYPE,
        id: recordId,
        chainId,
        address: formatEthereumAddress(address),
        transactions: [
            {
                at: now,
                hash,
                status: TransactionStatusType.NOT_DEPEND,
                candidates: {
                    [hash]: config,
                },
            },
            // place old transactions last
            ...(chunk?.transactions ?? []),
        ].slice(0, MAX_RECENT_TRANSACTIONS_SIZE),
        createdAt: chunk?.createdAt ?? now,
        updatedAt: now,
    })
    WalletMessages.events.transactionsUpdated.sendToAll()
}

export async function replaceRecentTransaction(
    chainId: ChainId,
    address: string,
    hash: string,
    newHash: string,
    newConfig?: EthereumTransactionConfig,
) {
    const now = new Date()
    const recordId = getRecordId(chainId, address)
    const chunk = await PluginDB.get(DB_TYPE, recordId)
    const transaction = chunk?.transactions.find((x) => Object.keys(x.candidates).includes(hash))
    if (!transaction) throw new Error('Failed to find a transaction to replace.')
    if (transaction.candidates?.[newHash]) return
    transaction.candidates = {
        ...transaction.candidates,
        [newHash]: newConfig ?? transaction.candidates[hash],
    }
    await PluginDB.add({
        type: DB_TYPE,
        id: recordId,
        chainId,
        address: formatEthereumAddress(address),
        transactions: chunk?.transactions ?? [],
        createdAt: chunk?.createdAt ?? now,
        updatedAt: now,
    })
    WalletMessages.events.transactionsUpdated.sendToAll()
}

export async function updateRecentTransaction(
    chainId: ChainId,
    address: string,
    hash: string,
    status: TransactionStatusType.SUCCEED | TransactionStatusType.FAILED | TransactionStatusType.CANCELLED,
) {
    const now = new Date()
    const recordId = getRecordId(chainId, address)
    const chunk = await PluginDB.get(DB_TYPE, recordId)
    const transaction = chunk?.transactions.find((x) => x.hash === hash)
    if (!transaction) throw new Error('Failed to find a transaction to update.')
    if (transaction.status === TransactionStatusType.NOT_DEPEND) transaction.status = status
    await PluginDB.add({
        type: DB_TYPE,
        id: recordId,
        chainId,
        address: formatEthereumAddress(address),
        transactions: chunk?.transactions ?? [],
        createdAt: chunk?.createdAt ?? now,
        updatedAt: now,
    })
    WalletMessages.events.transactionsUpdated.sendToAll()
}

export async function removeRecentTransaction(chainId: ChainId, address: string, hash: string) {
    const now = new Date()
    const recordId = getRecordId(chainId, address)
    const chunk = await PluginDB.get(DB_TYPE, recordId)
    if (!chunk) return
    await PluginDB.add({
        type: DB_TYPE,
        id: recordId,
        chainId: currentChainIdSettings.value,
        address: formatEthereumAddress(address),
        transactions: chunk.transactions.filter((x) => x.hash === hash),
        createdAt: chunk.createdAt,
        updatedAt: now,
    })
    WalletMessages.events.transactionsUpdated.sendToAll()
}

export async function getRecentTransactions(chainId: ChainId, address: string) {
    const recordId = getRecordId(chainId, address)
    const chunk = await PluginDB.get(DB_TYPE, recordId)
    return chunk?.transactions ?? []
}

export async function clearRecentTransactions(chainId: ChainId, address: string) {
    const recordId = getRecordId(chainId, address)
    await PluginDB.remove(DB_TYPE, recordId)
    WalletMessages.events.transactionsUpdated.sendToAll()
}
