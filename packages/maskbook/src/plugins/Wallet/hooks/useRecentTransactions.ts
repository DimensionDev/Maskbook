import { useEffect, useState } from 'react'
import { useAsyncRetry, useInterval } from 'react-use'
import { TransactionStatusType, useAccount, useChainId } from '@masknet/web3-shared'
import { WalletRPC } from '../messages'
import { WalletMessages } from '@masknet/plugin-wallet'

const UPDATE_TRANSACTION_LATENCY = 30 /* seconds */ * 1000 /* milliseconds  */

async function getTransactions(account: string, status?: TransactionStatusType) {
    if (!account) return []
    const transactions = await WalletRPC.getRecentTransactionsFromChain(account)
    return transactions.filter((x) => (typeof status !== 'undefined' ? x.status === status : true))
}

export function useRecentTransactions(status?: TransactionStatusType) {
    const account = useAccount()
    const chainId = useChainId()
    const [flag, setFlag] = useState(false)

    // update transactions status periodically
    const [delay, setDelay] = useState<number | null>(null)
    useInterval(() => setFlag((x) => !x), delay)

    // update transactions by message center
    useEffect(() => WalletMessages.events.transactionsUpdated.on(() => setFlag((x) => !x)), [setFlag])

    return useAsyncRetry(async () => {
        try {
            setDelay(null)
            return getTransactions(account, status)
        } catch (error) {
            throw error
        } finally {
            setDelay(UPDATE_TRANSACTION_LATENCY)
        }
    }, [account, status, flag, chainId])
}
