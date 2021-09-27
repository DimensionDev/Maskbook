import { WalletMessages } from '@masknet/plugin-wallet'
import type { ChainId } from '@masknet/web3-shared'
import type { TransactionReceipt } from 'web3-core'
import * as EthereumService from '../../../../extension/background-script/EthereumService'
import { currentChainIdSettings } from '../../settings'
import { MAX_RECENT_TRANSACTIONS_SIZE } from './database'

let timer: NodeJS.Timer | null = null
const WATCHED_TRANSACTION_CHECK_DELAY = 15 * 1000 // 15s
const WATCHED_TRANSACTION_CHECK_TIMES = 5 // 40 * 15s = 10m
const WATCHED_TRANSACTION_MAP = new Map<
    ChainId,
    Map<
        string,
        {
            at: number
            limits: number
            receipt: Promise<TransactionReceipt | null> | null
        }
    >
>()
const WATCHED_TRANSACTION_DELTA = 5

function getTransactionMap() {
    const key = currentChainIdSettings.value
    if (!WATCHED_TRANSACTION_MAP.has(key)) WATCHED_TRANSACTION_MAP.set(key, new Map())
    return WATCHED_TRANSACTION_MAP.get(key)!
}

function getTransactionReceipt(hash: string) {
    return EthereumService.getTransactionReceipt(hash)
        .then((receipt) => {
            if (receipt) WalletMessages.events.receiptUpdated.sendToAll(receipt)
            return receipt
        })
        .catch(() => null)
}

async function checkReceipt() {
    if (timer !== null) {
        clearTimeout(timer)
        timer = null
    }

    const map = getTransactionMap()
    const transactions = [...map.entries()].sort(([, a], [, z]) => z.at - a.at)
    const watchedTransactions = transactions.slice(0, MAX_RECENT_TRANSACTIONS_SIZE + WATCHED_TRANSACTION_DELTA)
    const unwatchedTransactions = transactions.slice(MAX_RECENT_TRANSACTIONS_SIZE + WATCHED_TRANSACTION_DELTA)
    unwatchedTransactions.forEach(([hash]) => unwatchTransaction(hash))

    const checkResult = await Promise.allSettled(
        watchedTransactions.map(async ([hash, transaction]) => {
            const record = map.get(hash)

            // the receipt is already fetched
            const receipt = await record?.receipt
            if (receipt) return true

            // excess the fetch limits
            const limits = record?.limits ?? WATCHED_TRANSACTION_CHECK_TIMES

            console.log(`The transaction receipt fetch limits of ${hash} is ${limits}.`)

            if (limits <= 0) return true

            map.set(hash, {
                at: transaction.at,
                limits: limits - 1,
                receipt: getTransactionReceipt(hash),
            })
            return false
        }),
    )

    if (checkResult.every((x) => x.status === 'fulfilled' && x.value)) return
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(checkReceipt, WATCHED_TRANSACTION_CHECK_DELAY)
}

export async function watchTransaction(hash: string) {
    const map = getTransactionMap()
    const record = map.get(hash)
    map.set(hash, {
        at: record?.at ?? Date.now(),
        limits: WATCHED_TRANSACTION_CHECK_TIMES,
        receipt: getTransactionReceipt(hash),
    })
    if (timer === null) timer = setTimeout(checkReceipt, WATCHED_TRANSACTION_CHECK_DELAY)
}

export function unwatchTransaction(hash: string) {
    getTransactionMap().delete(hash)
}

export function getState(hash: string) {
    // 0 for inactivated, 1 for activated
    return (getTransactionMap().get(hash)?.limits ?? 0) <= 0 ? 0 : 1
}

export async function getReceipt(hash: string) {
    return getTransactionMap().get(hash)?.receipt ?? null
}
