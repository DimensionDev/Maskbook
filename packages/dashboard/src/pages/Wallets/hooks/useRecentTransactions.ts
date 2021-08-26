import { useEffect, useState } from 'react'
import { useAsyncRetry, useInterval } from 'react-use'
import { TransactionStatusType, useAccount, useChainId } from '@masknet/web3-shared'
import { PluginMessages, PluginServices } from '../../../API'

const UPDATE_TRANSACTION_LATENCY = 30 /* seconds */ * 1000 /* milliseconds  */

async function getTransactions(account: string, status?: TransactionStatusType) {
    if (!account) return []
    const transactions = await PluginServices.Wallet.getRecentTransactionsFromChain(account)
    return transactions.filter((x) => (typeof status !== 'undefined' ? x.status === status : true))
}

export function useRecentTransactions(status?: TransactionStatusType) {
    const account = useAccount()
    const chainId = useChainId()
    const [flag, setFlag] = useState(false)

    // update transactions status intervally
    const [delay, setDelay] = useState(0)
    useInterval(() => setFlag((x) => !x), delay)

    // update transactions by message center
    useEffect(() => PluginMessages.Wallet.events.transactionsUpdated.on(() => setFlag((x) => !x)), [setFlag])

    return useAsyncRetry(async () => {
        try {
            setDelay(0)
            return getTransactions(account, status)
        } catch (error) {
            throw error
        } finally {
            setDelay(UPDATE_TRANSACTION_LATENCY)
        }
    }, [account, status, flag, chainId])
}
