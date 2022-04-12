import { useAccount, useChainId } from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import { WalletRPC } from '../messages'

export function useRemoveRecentTransaction() {
    const account = useAccount()
    const chainId = useChainId()

    return useCallback(
        async (hash: string) => {
            if (!account || !hash) return
            return WalletRPC.removeRecentTransaction(chainId, account, hash)
        },
        [chainId, account],
    )
}
