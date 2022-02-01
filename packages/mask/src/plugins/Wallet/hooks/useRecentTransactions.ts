import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { useAccount, useChainId } from '@masknet/web3-shared-evm'
import { WalletRPC } from '../messages'
import { WalletMessages } from '@masknet/plugin-wallet'
import type { RecentTransactionOptions } from '../services'

export function useRecentTransactions(options?: RecentTransactionOptions) {
    const account = useAccount()
    const chainId = useChainId()

    const result = useAsyncRetry(async () => {
        if (!account) return []
        return WalletRPC.getRecentTransactions(chainId, account, options)
    }, [chainId, account, JSON.stringify(options)])

    useEffect(() => WalletMessages.events.transactionStateUpdated.on(result.retry), [result.retry])
    useEffect(() => WalletMessages.events.transactionsUpdated.on(result.retry), [result.retry])

    return result
}
