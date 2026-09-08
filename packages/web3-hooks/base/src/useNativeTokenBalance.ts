import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useNativeTokenBalance<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: ConnectionOptions<T>,
) {
    const { account, chainId } = useChainContext({ account: options?.account, chainId: options?.chainId })
    const Web3 = useWeb3Connection(pluginID, {
        account,
        chainId,
        ...options,
    } as ConnectionOptions<T>)

    return useAsyncRetry(async () => {
        return Web3.getNativeTokenBalance()
    }, [account, chainId, Web3])
}
