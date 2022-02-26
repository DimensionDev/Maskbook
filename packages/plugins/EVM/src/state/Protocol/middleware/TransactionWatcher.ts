import { first, uniqBy } from 'lodash-unified'
import {
    ChainId,
    EthereumMethodType,
    getExplorerConstants,
    getPayloadConfig,
    getPayloadFrom,
    getPayloadSignature,
    getTransactionSignature,
} from '@masknet/web3-shared-evm'
import type { TransactionReceipt } from 'web3-core'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { Explorer } from '@masknet/web3-providers'
import type { Context, Middleware } from '../types'
import { getTransactionReceipt } from '../network'

interface StorageItem {
    at: number
    payload: JsonRpcPayload
    receipt: Promise<TransactionReceipt | null> | null
}

class Storage {
    static MAX_ITEM_SIZE = 40

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
        return this.getItems(chainId).slice(0, Storage.MAX_ITEM_SIZE)
    }

    public getUnwatched(chainId: ChainId) {
        return this.getItems(chainId).slice(Storage.MAX_ITEM_SIZE)
    }

    public getWatchedAccounts(chainId: ChainId) {
        return uniqBy(
            this.getWatched(chainId)
                .map(([_, transaction]) => getPayloadFrom(transaction.payload))
                .filter(Boolean) as string[],
            (x) => x.toLowerCase(),
        )
    }

    public getUnwatchedAccounts(chainId: ChainId) {
        return uniqBy(
            this.getUnwatched(chainId)
                .map(([_, transaction]) => getPayloadFrom(transaction.payload))
                .filter(Boolean) as string[],
            (x) => x.toLowerCase(),
        )
    }
}

class Watcher {
    static CHECK_DELAY = 30 * 1000 // seconds
    static LATEST_TRANSACTION_SIZE = 5

    private timer: NodeJS.Timeout | null = null
    private storage = new Storage()

    public async getReceiptFromCache(chainId: ChainId, hash: string) {
        return this.storage.getItem(chainId, hash)?.receipt ?? null
    }

    public async getReceiptFromChain(chainId: ChainId, hash: string) {
        return getTransactionReceipt(hash, {
            chainId,
        })
    }

    private async checkReceipt(chainId: ChainId) {
        await Promise.allSettled(
            this.storage.getWatched(chainId).map(async ([hash, transaction]) => {
                const receipt = await this.storage.getItem(chainId, hash)?.receipt
                if (receipt) return
                this.storage.setItem(chainId, hash, {
                    ...transaction,
                    receipt: this.getReceiptFromChain(chainId, hash),
                })
            }),
        )
    }

    private async checkAccount(chainId: ChainId, account: string) {
        const { API_KEYS = [], EXPLORER_API = '' } = getExplorerConstants(chainId)

        const watchedTransactions = this.storage.getWatched(chainId)
        const latestTransactions = await Explorer.getLatestTransactions(account, EXPLORER_API, {
            offset: Watcher.LATEST_TRANSACTION_SIZE,
            apikey: first(API_KEYS),
        })

        for (const latestTransaction of latestTransactions) {
            const [watchedHash] =
                watchedTransactions.find(([hash, transaction]) => {
                    // the transaction hash exact matched
                    if (latestTransaction.hash === hash) return true

                    // the transaction nonce exact matched
                    const config = getPayloadConfig(transaction.payload)
                    if (config?.nonce) return config.nonce === latestTransaction.nonce

                    // the transaction signature id exact matched
                    if (getTransactionSignature(latestTransaction) === getPayloadSignature(transaction.payload))
                        return true

                    return false
                }) ?? []

            if (!watchedHash || watchedHash === latestTransaction.hash) continue
        }
    }

    private async check(chainId: ChainId) {
        // stop any pending task
        this.stopCheck()

        // unwatch legacy transactions
        this.storage.getUnwatched(chainId).forEach(([hash]) => this.unwatchTransaction(chainId, hash))

        try {
            await this.checkReceipt(chainId)
            for (const account of this.storage.getWatchedAccounts(chainId)) await this.checkAccount(chainId, account)
        } catch (error) {
            // do nothing
        }

        // check if all transaction receipts were found
        const allSettled = await Promise.allSettled(
            this.storage.getWatched(chainId).map(([, transaction]) => transaction.receipt),
        )
        if (allSettled.every((x) => x.status === 'fulfilled' && x.value)) return

        // kick to the next round
        this.startCheck(chainId)
    }

    private startCheck(chainId: ChainId) {
        this.stopCheck()
        if (this.timer === null) {
            this.timer = setTimeout(this.check.bind(this, chainId), Watcher.CHECK_DELAY)
        }
    }

    private stopCheck() {
        if (this.timer !== null) clearTimeout(this.timer)
        this.timer = null
    }

    public watchTransaction(chainId: ChainId, hash: string, payload: JsonRpcPayload) {
        if (!this.storage.hasItem(chainId, hash)) {
            this.storage.setItem(chainId, hash, {
                at: Date.now(),
                payload,
                receipt: Promise.resolve(null),
            })
        }
        this.startCheck(chainId)
    }

    public unwatchTransaction(chainId: ChainId, hash: string) {
        this.storage.removeItem(chainId, hash)
    }
}

export class TransactionWatcher implements Middleware<Context> {
    private watcher = new Watcher()

    async fn(context: Context, next: () => Promise<void>) {
        switch (context.method) {
            case EthereumMethodType.MASK_WATCH_TRANSACTION: {
                const [hash, payload] = context.request.params as [string, JsonRpcPayload]
                this.watcher.watchTransaction(context.chainId, hash, payload)
                context.end()
                break
            }
            case EthereumMethodType.MASK_UNWATCH_TRANSACTION: {
                const [hash] = context.request.params as [string]
                this.watcher.unwatchTransaction(context.chainId, hash)
                context.end()
                break
            }

            // the original eth_getTransactionReceipt will read receipt from storage
            case EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT:
                try {
                    const [hash] = context.request.params as [string]
                    context.write(await this.watcher.getReceiptFromCache(context.chainId, hash))
                } catch {
                    context.end()
                }
                break

            // the mask_getTransactionReceipt method will read receipt from chain
            case EthereumMethodType.MASK_GET_TRANSACTION_RECEIPT:
                try {
                    const [hash] = context.request.params as [string]
                    context.write(await getTransactionReceipt(hash))
                } catch (error) {
                    context.abort(error)
                }
                break
            default:
                break
        }
        await next()
    }
}
