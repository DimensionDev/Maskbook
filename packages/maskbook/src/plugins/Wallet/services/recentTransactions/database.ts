import { uniqBy } from 'lodash-es'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { WalletMessages } from '@masknet/plugin-wallet'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared'
import { PLUGIN_IDENTIFIER } from '../../constants'
import { createPluginDatabase } from '../../../../database/Plugin/wrap-plugin-database'
import { currentChainIdSettings } from '../../settings'

export const MAX_RECENT_TRANSACTIONS_SIZE = 20

export interface RecentTransaction {
    hash: string
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

const RecentTransactionChunkDB = createPluginDatabase<RecentTransactionChunk>(PLUGIN_IDENTIFIER)

export async function addRecentTransaction(address: string, hash: string, payload: JsonRpcPayload) {
    const now = new Date()
    const recordId = getRecordId(address)
    const chunk = await RecentTransactionChunkDB.get('recent-transactions', recordId)
    await RecentTransactionChunkDB.add({
        type: 'recent-transactions',
        id: getRecordId(address),
        chainId: currentChainIdSettings.value,
        address: formatEthereumAddress(address),
        transactions: uniqBy(
            [
                {
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

export async function getRecentTransactions(address: string) {
    const recordId = getRecordId(address)
    const chunk = await RecentTransactionChunkDB.get('recent-transactions', recordId)
    return chunk?.transactions ?? []
}

export async function clearRecentTransactions(address: string) {
    const recordId = getRecordId(address)
    await RecentTransactionChunkDB.remove('recent-transactions', recordId)
    WalletMessages.events.recentTransactionsUpdated.sendToAll()
}
