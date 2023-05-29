import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useAccount } from './useAccount.js'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useTransferNonFungibleToken<T extends NetworkPluginID>(
    pluginID: T,
    recipient: string,
    tokenId: string | null,
    tokenAddress?: string,
    options?: ConnectionOptions<T>,
) {
    const account = useAccount(pluginID)
    const Web3 = useWeb3Connection(pluginID, {
        ...options,
        account,
    })

    return useAsyncRetry(async () => {
        if (!tokenId) return
        return Web3.transferNonFungibleToken(tokenAddress, recipient, tokenId, '1')
    }, [tokenId, tokenAddress, recipient, Web3])
}
