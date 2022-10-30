import { useAsyncRetry } from 'react-use'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useAccount } from './useAccount.js'
import { useWeb3State } from './useWeb3State.js'

export function useTransferNonFungibleToken<T extends NetworkPluginID>(
    pluginID: T,
    recipient: string,
    tokenId: string | null,
    tokenAddress?: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    const account = useAccount(pluginID)
    const { Connection } = useWeb3State<'all'>(pluginID)

    return useAsyncRetry(async () => {
        const connection = await Connection?.getConnection?.()
        if (!tokenId || !connection) return
        return connection.transferNonFungibleToken(tokenAddress, recipient, tokenId, '1', undefined, {
            account,
            ...options,
            overrides: {
                from: account,
            },
        })
    }, [account, tokenId, tokenAddress, pluginID, recipient, JSON.stringify(options), Connection])
}
