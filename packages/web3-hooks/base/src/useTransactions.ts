import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useTransactions<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: NetworkPluginID,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const { account, chainId } = useChainContext()
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry<Array<Web3Helper.TransactionScope<S, T>> | undefined>(async () => {
        const response = await hub?.getTransactions(options?.chainId ?? chainId, options?.account ?? account)
        return response?.data
    }, [account, chainId, hub])
}
