import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { TransactionStatusType, useAccount, useChainId } from '@masknet/web3-shared-evm'
import { PluginMessages, PluginServices } from '../../../API'

// todo: should merge in plugin infra package when plugin infra ready
export function useRecentTransactions(status?: TransactionStatusType) {
    const account = useAccount()
    const chainId = useChainId()

    const result = useAsyncRetry(async () => {
        if (!account) return []
        const transactions = await PluginServices.Wallet.getRecentTransactionList(account)
        return transactions.filter((x) => (typeof status !== 'undefined' ? x.status === status : true))
    }, [account, status, chainId])

    useEffect(() => PluginMessages.Wallet.events.receiptUpdated.on(result.retry), [result.retry])
    useEffect(() => PluginMessages.Wallet.events.recentTransactionsUpdated.on(result.retry), [result.retry])

    return result
}
