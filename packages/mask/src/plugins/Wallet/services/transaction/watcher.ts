import { first } from 'lodash-unified'
import type { TransactionReceipt } from 'web3-core'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { WalletMessages } from '@masknet/plugin-wallet'
import { getLatestTransactions } from '@masknet/web3-providers'
import {
    ChainId,
    getExplorerConstants,
    isSameAddress,
    resolveExplorerAPI,
    TransactionStateType,
} from '@masknet/web3-shared-evm'
import * as EthereumService from '../../../../extension/background-script/EthereumService'
import * as progress from './progress'
import * as helpers from './helpers'
import { currentAccountSettings, currentChainIdSettings } from '../../settings'
import { WalletRPC } from '../../messages'

interface TransactionRecord {
    at: number
    payload?: JsonRpcPayload
    receipt: Promise<TransactionReceipt | null> | null
}

let timer: NodeJS.Timer | null = null
const WATCHED_TRANSACTION_CHECK_DELAY = 15 * 1000 // 15s
const WATCHED_TRANSACTION_MAP = new Map<ChainId, Map<string, TransactionRecord>>()
const WATCHED_TRANSACTIONS_SIZE = 40

function getMap(chainId: ChainId) {
    if (!WATCHED_TRANSACTION_MAP.has(chainId)) WATCHED_TRANSACTION_MAP.set(chainId, new Map())
    return WATCHED_TRANSACTION_MAP.get(chainId)!
}

function getTransaction(chainId: ChainId, hash: string) {
    return getMap(chainId).get(hash)
}

function setTransaction(chainId: ChainId, hash: string, transaction: TransactionRecord) {
    getMap(chainId).set(hash, transaction)
}

function removeTransaction(chainId: ChainId, hash: string) {
    getMap(chainId).delete(hash)
}

function getTransactions(chainId: ChainId) {
    const map = getMap(chainId)
    return map ? [...map.entries()].sort(([, a], [, z]) => z.at - a.at) : []
}

function getWatchedTransactions(chainId: ChainId) {
    return getTransactions(chainId).slice(0, WATCHED_TRANSACTIONS_SIZE)
}

function getUnwatchedTransactions(chainId: ChainId) {
    return getTransactions(chainId).slice(WATCHED_TRANSACTIONS_SIZE)
}

async function getTransactionReceipt(chainId: ChainId, hash: string) {
    try {
        const transaction = await EthereumService.getTransactionByHash(hash, {
            chainId,
        })
        if (!transaction) return null

        progress.notifyTransactionProgress(transaction, {
            type: TransactionStateType.HASH,
            hash,
        })

        const receipt = await EthereumService.getTransactionReceipt(hash, {
            chainId,
        })
        if (!receipt) return null

        const transactionState = helpers.getTransactionState(receipt)
        progress.notifyTransactionProgress(transaction, transactionState)
        WalletMessages.events.transactionStateUpdated.sendToAll(transactionState)
        return receipt
    } catch {
        return null
    }
}

async function checkReceipt(chainId: ChainId) {
    await Promise.allSettled(
        getWatchedTransactions(chainId).map(async ([hash, transaction]) => {
            const receipt = await getTransaction(chainId, hash)?.receipt
            if (receipt) return
            setTransaction(chainId, hash, {
                ...transaction,
                receipt: getTransactionReceipt(chainId, hash),
            })
        }),
    )
}

async function checkAccount(chainId: ChainId, account: string) {
    const API_URL = resolveExplorerAPI(chainId)
    const { API_KEYS = [] } = getExplorerConstants(chainId)

    const watchedTransactions = getWatchedTransactions(chainId)
    const latestTransactions = await getLatestTransactions(account, API_URL, {
        offset: 5,
        apikey: first(API_KEYS),
    })

    for (const latestTransaction of latestTransactions) {
        const [watchedHash, watchedTransaction] =
            watchedTransactions.find(([hash, transaction]) => {
                // the transation hash exact matched
                if (latestTransaction.hash === hash) return true

                // the transaction signature id exact matched
                if (!transaction.payload) return false
                if (helpers.getTransactionId(latestTransaction) === helpers.getPayloadId(transaction.payload))
                    return true

                // the transaction nonce exact matched
                const config = helpers.getPayloadConfig(transaction.payload)
                if (!config) return false
                return (
                    isSameAddress(latestTransaction.from, config.from as string) &&
                    latestTransaction.nonce === config.nonce
                )
            }) ?? []

        if (!watchedHash || !watchedTransaction?.payload) continue

        // replace the original transaction in DB
        await WalletRPC.replaceRecentTransaction(
            chainId,
            account,
            watchedHash,
            latestTransaction.hash,
            watchedTransaction.payload,
        )

        // update receipt in cache
        removeTransaction(chainId, watchedHash)
        setTransaction(chainId, latestTransaction.hash, {
            ...watchedTransaction,
            receipt: getTransactionReceipt(chainId, latestTransaction.hash),
        })
    }
}

async function checkTransaction() {
    if (timer !== null) {
        clearTimeout(timer)
        timer = null
    }

    const chainId = currentChainIdSettings.value
    const account = currentAccountSettings.value

    // unwatch legacy transactions in the map
    getUnwatchedTransactions(chainId).forEach(([hash]) => unwatchTransaction(chainId, hash))

    try {
        await checkReceipt(chainId)
        await checkAccount(chainId, account)
    } catch {
        // do nothing
    }

    // check if all transaction receipt were loaded
    const allSettled = await Promise.allSettled(
        getWatchedTransactions(chainId).map(([, transaction]) => transaction.receipt),
    )
    if (allSettled.every((x) => x.status === 'fulfilled' && x.value)) return

    // kick to next the round
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => {
        const chainId = currentChainIdSettings.value
        const account = currentAccountSettings.value
        checkReceipt(chainId)
        checkAccount(chainId, account)
    }, WATCHED_TRANSACTION_CHECK_DELAY)
}

export async function getReceipt(chainId: ChainId, hash: string) {
    return getTransaction(chainId, hash)?.receipt ?? null
}

export async function watchTransaction(chainId: ChainId, hash: string, payload?: JsonRpcPayload) {
    const transaction = getTransaction(chainId, hash)
    if (!transaction) {
        setTransaction(chainId, hash, {
            at: Date.now(),
            payload,
            receipt: getTransactionReceipt(chainId, hash),
        })
    }
    if (timer === null) {
        timer = setTimeout(checkTransaction, WATCHED_TRANSACTION_CHECK_DELAY)
    }
}

export function unwatchTransaction(chainId: ChainId, hash: string) {
    removeTransaction(chainId, hash)
}
