import { uniqBy } from 'lodash-unified'
import { WalletMessages } from '@masknet/plugin-wallet'
import { ChainId, EthereumTransactionConfig, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { currentChainIdSettings } from '../../settings'
import { PluginDB } from '../../database/Plugin.db'

export const MAX_RECENT_TRANSACTIONS_SIZE = 20

export interface RecentTransaction {
    at: Date
    hash: string
    config: EthereumTransactionConfig
    candidates: Record<string, EthereumTransactionConfig>
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
    const chunk = await PluginDB.get('recent-transactions', recordId)
    await PluginDB.add({
        type: 'recent-transactions',
        id: recordId,
        chainId,
        address: formatEthereumAddress(address),
        transactions: uniqBy(
            [
                {
                    at: now,
                    hash,
                    config,
                    candidates: {
                        [hash]: config,
                    },
                },
                // place old transactions last
                ...(chunk?.transactions ?? []),
            ],
            (x) => x.hash,
        ).slice(0, MAX_RECENT_TRANSACTIONS_SIZE),
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
    const chunk = await PluginDB.get('recent-transactions', recordId)
    const transaction = chunk?.transactions.find((x) => x.hash === hash)
    if (!transaction) throw new Error('Failed to find the old transaction.')
    if (transaction.candidates?.[newHash]) return
    transaction.candidates = {
        ...transaction.candidates,
        [newHash]: newConfig ?? transaction.candidates[hash],
    }
    await PluginDB.add({
        type: 'recent-transactions',
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
    const chunk = await PluginDB.get('recent-transactions', recordId)
    if (!chunk) return
    await PluginDB.add({
        type: 'recent-transactions',
        id: recordId,
        chainId: currentChainIdSettings.value,
        address: formatEthereumAddress(address),
        transactions: chunk.transactions.filter((x) => x.hash !== hash),
        createdAt: chunk.createdAt,
        updatedAt: now,
    })
    WalletMessages.events.transactionsUpdated.sendToAll()
}

export async function getRecentTransactions(chainId: ChainId, address: string) {
    const recordId = getRecordId(chainId, address)
    const chunk = await PluginDB.get('recent-transactions', recordId)
    return chunk?.transactions ?? []
}

export async function clearRecentTransactions(chainId: ChainId, address: string) {
    const recordId = getRecordId(chainId, address)
    await PluginDB.remove('recent-transactions', recordId)
    WalletMessages.events.transactionsUpdated.sendToAll()
}
