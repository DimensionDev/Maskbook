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
import { currentChainIdSettings } from '../../settings'
import { WalletRPC } from '../../messages'

interface StorageItem {
    at: number
    limits: number
    payload: JsonRpcPayload
    receipt: Promise<TransactionReceipt | null> | null
}

class Storage {
    static SIZE = 40

    private map = new Map<ChainId, Map<string, StorageItem>>()

    private getStorage(chainId: ChainId) {
        if (!this.map.has(chainId)) this.map.set(chainId, new Map())
        return this.map.get(chainId)!
    }

    public hasItem(chainId: ChainId, hash: string) {
        return this.getStorage(chainId).has(hash)
    }

    public getItem(chainId: ChainId, hash: string) {
        return this.getStorage(chainId).get(hash)
    }

    public setItem(chainId: ChainId, hash: string, transaction: StorageItem) {
        this.getStorage(chainId).set(hash, transaction)
    }

    public removeItem(chainId: ChainId, hash: string) {
        this.getStorage(chainId).delete(hash)
    }

    public getItems(chainId: ChainId) {
        const map = this.getStorage(chainId)
        return map ? [...map.entries()].sort(([, a], [, z]) => z.at - a.at) : []
    }

    public getWatched(chainId: ChainId) {
        return this.getItems(chainId).slice(0, Storage.SIZE)
    }

    public getUnwatched(chainId: ChainId) {
        return this.getItems(chainId).slice(Storage.SIZE)
    }

    public getWatchedAccounts(chainId: ChainId) {
        return this.getWatched(chainId)
            .map(([_, transaction]) => helpers.getPayloadFrom(transaction.payload))
            .filter(Boolean) as string[]
    }

    public getUnwatchedAccounts(chainId: ChainId) {
        return this.getUnwatched(chainId)
            .map(([_, transaction]) => helpers.getPayloadFrom(transaction.payload))
            .filter(Boolean) as string[]
    }
}

let timer: NodeJS.Timer | null = null
const storage = new Storage()
const CHECK_TIMES = 30
const CHECK_DELAY = 30 * 1000 // seconds
const CHECK_LATEST_SIZE = 5

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
        storage.getWatched(chainId).map(async ([hash, transaction]) => {
            const receipt = await storage.getItem(chainId, hash)?.receipt
            if (receipt) return
            storage.setItem(chainId, hash, {
                ...transaction,
                receipt: getTransactionReceipt(chainId, hash),
            })
        }),
    )
}

async function checkAccount(chainId: ChainId, account: string) {
    const API_URL = resolveExplorerAPI(chainId)
    const { API_KEYS = [] } = getExplorerConstants(chainId)

    const watchedTransactions = storage.getWatched(chainId)
    const latestTransactions = await getLatestTransactions(account, API_URL, {
        offset: CHECK_LATEST_SIZE,
        apikey: first(API_KEYS),
    })

    for (const latestTransaction of latestTransactions) {
        const [watchedHash, watchedTransaction] =
            watchedTransactions.find(([hash, transaction]) => {
                // the transaction hash exact matched
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
        storage.removeItem(chainId, watchedHash)
        storage.setItem(chainId, latestTransaction.hash, {
            ...watchedTransaction,
            payload: helpers.toPayload(latestTransaction),
            receipt: getTransactionReceipt(chainId, latestTransaction.hash),
        })
    }
}

async function check() {
    // stop any pending task
    stopCheck()

    const chainId = currentChainIdSettings.value

    // unwatch legacy transactions
    storage.getUnwatched(chainId).forEach(([hash]) => unwatchTransaction(chainId, hash))

    // update limits
    storage.getWatched(chainId).forEach(([hash, transaction]) => {
        storage.setItem(chainId, hash, {
            ...transaction,
            limits: Math.max(0, transaction.limits - 1),
        })
    })

    try {
        await checkReceipt(chainId)
        for (const account of storage.getWatchedAccounts(chainId)) await checkAccount(chainId, account)
    } catch (error) {
        // do nothing
    }

    // check if all transaction receipts were found
    const allSettled = await Promise.allSettled(
        storage.getWatched(chainId).map(([, transaction]) => transaction.receipt),
    )
    if (allSettled.every((x) => x.status === 'fulfilled' && x.value)) return

    // kick to the next round
    startCheck(true)
}

function startCheck(force: boolean) {
    if (force) stopCheck()
    if (timer === null) {
        timer = setTimeout(check, CHECK_DELAY)
    }
}

function stopCheck() {
    if (timer !== null) clearTimeout(timer)
    timer = null
}

export async function getReceipt(chainId: ChainId, hash: string) {
    return storage.getItem(chainId, hash)?.receipt ?? null
}

export async function watchTransaction(chainId: ChainId, hash: string, payload: JsonRpcPayload) {
    if (!storage.hasItem(chainId, hash)) {
        storage.setItem(chainId, hash, {
            at: Date.now(),
            payload,
            limits: CHECK_TIMES,
            receipt: Promise.resolve(null),
        })
    }
    startCheck(false)
}

export function unwatchTransaction(chainId: ChainId, hash: string) {
    storage.removeItem(chainId, hash)
}
