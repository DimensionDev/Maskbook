import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncRetry } from 'react-use'
import { useAccount, useChainId, useWeb3Hub } from '../entry-web3'
import type { Web3Helper } from '../web3-helpers'

export function useTransactions<T extends NetworkPluginID>(
    pluginID?: NetworkPluginID,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    const account = useAccount(pluginID)
    const chainId = useChainId(pluginID)
    const hub = useWeb3Hub<'all'>(pluginID, options)

    return useAsyncRetry(async () => {
        return hub?.getTransactions(chainId, account)
    }, [account, hub, account, chainId])
}
