import { uniqBy } from 'lodash-es'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { WalletMessages } from '@masknet/plugin-wallet'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared'
import { currentChainIdSettings } from '../../settings'
import { PluginDB } from '../../database/Plugin.db'

export const MAX_RECENT_TRANSACTIONS_SIZE = 20

export interface RecentTransaction {
    at: Date
    hash: string
    hashReplacement?: string
    payload: JsonRpcPayload
}

export interface RecentTransactionChunk {
    id: string // chainId + address
    chainId: ChainId
    address: string
    type: 'recent-transactions'
    transactions: RecentTransaction[]
    createdAt: Date
    updatedAt: Date
}

function getRecordId(address: string) {
    return `${currentChainIdSettings.value}_${formatEthereumAddress(address)}`
}

export async function addRecentTransaction(address: string, hash: string, payload: JsonRpcPayload) {
    const now = new Date()
    const recordId = getRecordId(address)
    const chunk = await PluginDB.get('recent-transactions', recordId)
    await PluginDB.add({
        type: 'recent-transactions',
        id: getRecordId(address),
        chainId: currentChainIdSettings.value,
        address: formatEthereumAddress(address),
        transactions: uniqBy(
            [
                {
                    at: now,
                    hash,
                    payload,
                },
                // place old transactions last
                ...(chunk?.transactions ?? []),
            ],
            (x) => x.hash,
        ).slice(0, MAX_RECENT_TRANSACTIONS_SIZE),
        createdAt: chunk?.createdAt ?? now,
        updatedAt: now,
    })
    WalletMessages.events.recentTransactionsUpdated.sendToAll()
}

export async function replaceRecentTransaction(address: string, oldHash: string, newHash: string) {
    const now = new Date()
    const recordId = getRecordId(address)
    const chunk = await PluginDB.get('recent-transactions', recordId)
    const transaction = chunk?.transactions.find((x) => x.hash === oldHash)
    if (!transaction) throw new Error('Failed to find the old transaction.')
    transaction.hashReplacement = newHash
    await PluginDB.add({
        type: 'recent-transactions',
        id: getRecordId(address),
        chainId: currentChainIdSettings.value,
        address: formatEthereumAddress(address),
        transactions: chunk?.transactions ?? [],
        createdAt: chunk?.createdAt ?? now,
        updatedAt: now,
    })
    WalletMessages.events.recentTransactionsUpdated.sendToAll()
}

export async function removeRecentTransaction(address: string, hash: string) {
    const now = new Date()
    const recordId = getRecordId(address)
    const chunk = await PluginDB.get('recent-transactions', recordId)
    if (!chunk) return
    await PluginDB.add({
        type: 'recent-transactions',
        id: getRecordId(address),
        chainId: currentChainIdSettings.value,
        address: formatEthereumAddress(address),
        transactions: chunk.transactions.filter((x) => x.hash !== hash),
        createdAt: chunk.createdAt,
        updatedAt: now,
    })
    WalletMessages.events.recentTransactionsUpdated.sendToAll()
}

export async function getRecentTransactions(address: string) {
    const recordId = getRecordId(address)
    const chunk = await PluginDB.get('recent-transactions', recordId)
    return chunk?.transactions ?? []
}

export async function clearRecentTransactions(address: string) {
    const recordId = getRecordId(address)
    await PluginDB.remove('recent-transactions', recordId)
    WalletMessages.events.recentTransactionsUpdated.sendToAll()
}
