import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAccount, useChainId, useWeb3Hub } from '../entry-web3'
import type { Web3Helper } from '../web3-helpers'

export function useTransactions<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: NetworkPluginID,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const account = useAccount(pluginID)
    const chainId = useChainId(pluginID)
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry<Array<Web3Helper.TransactionScope<S, T>> | undefined>(async () => {
        return hub?.getTransactions(options?.chainId ?? chainId, options?.account ?? account)
    }, [account, chainId, hub])
}
