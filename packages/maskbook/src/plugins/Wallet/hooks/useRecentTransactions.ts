import { useState } from 'react'
import { useAsyncRetry, useInterval } from 'react-use'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId } from '../../../web3/hooks/useChainId'
import { WalletRPC } from '../messages'

const UPDATE_TRANSACTION_LATENCY = 30 /* seconds */ * 1000 /* milliseconds  */

export function useRecentTransactions() {
    const account = useAccount()
    const chainId = useChainId()
    const [flag, setFlag] = useState(false)

    // update transaction status intervally
    useInterval(() => setFlag((x) => !x), UPDATE_TRANSACTION_LATENCY)

    return useAsyncRetry(async () => {
        await WalletRPC.updateTransactions(account)
        return WalletRPC.getRecentTransactions(account)
    }, [flag, account, chainId])
}
