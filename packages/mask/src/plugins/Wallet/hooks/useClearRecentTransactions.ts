import { useAccount, useChainId } from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import { WalletRPC } from '../messages'

export function useClearRecentTransactions() {
    const account = useAccount()
    const chainId = useChainId()

    return useCallback(async () => {
        if (!account) return
        await WalletRPC.clearRecentTransactions(chainId, account)
    }, [chainId, account])
}
