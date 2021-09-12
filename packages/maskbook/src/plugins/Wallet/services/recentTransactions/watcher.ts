import { WalletMessages } from '@masknet/plugin-wallet'
import type { ChainId } from '@masknet/web3-shared'
import type { TransactionReceipt } from 'web3-core'
import { getTransactionReceipt } from '../../../../extension/background-script/EthereumService'
import { currentChainIdSettings } from '../../settings'
import { MAX_RECENT_TRANSACTIONS_SIZE } from './database'

let timer: NodeJS.Timer | null = null
const WATCHED_TRANSACTION_CHECK_DELAY = 15 * 1000 // 15s
const WATCHED_TRANSACTION_MAP = new Map<
    ChainId,
    Map<
        string,
        {
            at: number
            receipt: TransactionReceipt | null
        }
    >
>()
const WATCHED_TRANSACTION_DELTA = 5

function getTransactionMap() {
    const key = currentChainIdSettings.value
    if (!WATCHED_TRANSACTION_MAP.has(key)) WATCHED_TRANSACTION_MAP.set(key, new Map())
    return WATCHED_TRANSACTION_MAP.get(key)!
}

async function watchTransaction(hash: string) {
    const map = getTransactionMap()
    map.set(hash, {
        at: Date.now(),
        receipt: null,
    })
    if (timer === null) timer = setTimeout(kickToNextCheckRound, WATCHED_TRANSACTION_CHECK_DELAY)
}

function unwatchTransaction(hash: string) {
    getTransactionMap().delete(hash)
}

async function kickToNextCheckRound() {
    const map = getTransactionMap()
    const transactions = [...map.entries()].sort(([, a], [, z]) => z.at - a.at)
    const watchedTransactions = transactions.slice(0, MAX_RECENT_TRANSACTIONS_SIZE + WATCHED_TRANSACTION_DELTA)
    const unwatchedTransactions = transactions.slice(MAX_RECENT_TRANSACTIONS_SIZE + WATCHED_TRANSACTION_DELTA)
    unwatchedTransactions.forEach(([hash]) => unwatchTransaction(hash))
    await Promise.allSettled(
        watchedTransactions.map(async ([hash, transaction]) => {
            if (transaction.receipt) return
            const receipt = await getTransactionReceipt(hash)
            if (receipt) {
                map.set(hash, {
                    at: transaction.at,
                    receipt,
                })
                WalletMessages.events.receiptUpdated.sendToAll(receipt)
            }
        }),
    )
    if ([...map.values()].some((x) => !x.receipt))
        timer = setTimeout(kickToNextCheckRound, WATCHED_TRANSACTION_CHECK_DELAY)
    else timer = null
}

export async function getReceipt(hash: string): Promise<TransactionReceipt | null> {
    const map = getTransactionMap()
    const receipt = map.get(hash)?.receipt
    if (receipt) return receipt
    watchTransaction(hash)
    return null
}
