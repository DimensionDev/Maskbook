import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { TransactionStatusType, useAccount, useChainId } from '@masknet/web3-shared-evm'
import { WalletRPC } from '../messages'
import { WalletMessages } from '@masknet/plugin-wallet'

export function useRecentTransactions(status?: TransactionStatusType) {
    const account = useAccount()
    const chainId = useChainId()

    const result = useAsyncRetry(async () => {
        if (!account) return []
        const transactions = await WalletRPC.getRecentTransactions(chainId, account)
        return transactions.filter((x) => (typeof status !== 'undefined' ? x.status === status : true))
    }, [chainId, account, status])

    useEffect(() => WalletMessages.events.transactionStateUpdated.on(result.retry), [result.retry])
    useEffect(() => WalletMessages.events.transactionsUpdated.on(result.retry), [result.retry])

    return result
}
