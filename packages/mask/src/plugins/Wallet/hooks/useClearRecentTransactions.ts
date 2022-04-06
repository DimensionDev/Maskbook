import { useAccount, useChainId } from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import { WalletRPC } from '../messages'

export function useClearRecentTransactions() {
    const account = useAccount()
    const chainId = useChainId()

    const clear = useCallback(async () => {
        if (!account) return
        await WalletRPC.clearRecentTransactions(chainId, account)
    }, [chainId, account])

    return clear
}
