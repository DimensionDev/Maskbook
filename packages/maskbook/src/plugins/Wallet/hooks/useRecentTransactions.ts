import { useState } from 'react'
import { useAsyncRetry, useInterval } from 'react-use'
import { useAccount, useChainId } from '@masknet/web3-shared'
import { WalletRPC } from '../messages'

const UPDATE_TRANSACTION_LATENCY = 30 /* seconds */ * 1000 /* milliseconds  */

export function useRecentTransactions() {
    const account = useAccount()
    const chainId = useChainId()
    const [flag, setFlag] = useState(false)

    // update transaction status intervally
    useInterval(() => setFlag((x) => !x), UPDATE_TRANSACTION_LATENCY)

    return useAsyncRetry(async () => {
        if (!account) return []
        const transactions = await WalletRPC.getRecentTransactionsFromChain(account)
        return transactions
    }, [account, flag, chainId])
}
