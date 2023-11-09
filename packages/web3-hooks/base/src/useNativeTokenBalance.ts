import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useNativeTokenBalance<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: ConnectionOptions<T>,
) {
    const { account } = useChainContext({ account: options?.account })
    const Web3 = useWeb3Connection(pluginID, {
        account,
        ...options,
    } as ConnectionOptions<T>)

    return useAsyncRetry(async () => {
        return Web3.getNativeTokenBalance()
    }, [account, Web3])
}
