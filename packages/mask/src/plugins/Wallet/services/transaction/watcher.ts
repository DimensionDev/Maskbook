import type { TransactionReceipt } from 'web3-core'
import { WalletMessages } from '@masknet/plugin-wallet'
import { ChainId, TransactionStateType } from '@masknet/web3-shared-evm'
import * as EthereumService from '../../../../extension/background-script/EthereumService'
import * as progress from './progress'
import * as helpers from './helpers'
import { currentChainIdSettings } from '../../settings'

let timer: NodeJS.Timer | null = null
const WATCHED_TRANSACTION_CHECK_DELAY = 15 * 1000 // 15s
const WATCHED_TRANSACTION_MAP = new Map<
    ChainId,
    Map<
        string,
        {
            at: number
            receipt: Promise<TransactionReceipt | null> | null
        }
    >
>()
const WATCHED_TRANSACTIONS_SIZE = 40

function getTransactionMap(chainId: ChainId) {
    if (!WATCHED_TRANSACTION_MAP.has(chainId)) WATCHED_TRANSACTION_MAP.set(chainId, new Map())
    return WATCHED_TRANSACTION_MAP.get(chainId)!
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

async function checkReceipt() {
    if (timer !== null) {
        clearTimeout(timer)
        timer = null
    }

    const chainId = currentChainIdSettings.value
    const map = getTransactionMap(chainId)
    const transactions = [...map.entries()].sort(([, a], [, z]) => z.at - a.at)
    const watchedTransactions = transactions.slice(0, WATCHED_TRANSACTIONS_SIZE)
    const unwatchedTransactions = transactions.slice(WATCHED_TRANSACTIONS_SIZE)
    unwatchedTransactions.forEach(([hash]) => unwatchTransaction(chainId, hash))

    const checkResult = await Promise.allSettled(
        watchedTransactions.map(async ([hash, transaction]) => {
            const receipt = await map.get(hash)?.receipt
            if (receipt) return true
            map.set(hash, {
                at: transaction.at,
                receipt: getTransactionReceipt(chainId, hash),
            })
            return false
        }),
    )

    if (checkResult.every((x) => x.status === 'fulfilled' && x.value)) return
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(checkReceipt, WATCHED_TRANSACTION_CHECK_DELAY)
}

export async function getReceipt(chainId: ChainId, hash: string) {
    return getTransactionMap(chainId).get(hash)?.receipt ?? null
}

export async function watchTransaction(chainId: ChainId, hash: string) {
    const map = getTransactionMap(chainId)
    if (!map.has(hash)) {
        map.set(hash, {
            at: Date.now(),
            receipt: getTransactionReceipt(chainId, hash),
        })
    }
    if (timer === null) timer = setTimeout(checkReceipt, WATCHED_TRANSACTION_CHECK_DELAY)
}

export function unwatchTransaction(chainId: ChainId, hash: string) {
    getTransactionMap(chainId).delete(hash)
}
