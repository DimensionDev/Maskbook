import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useBlockTimestamp<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: ConnectionOptions<T>,
) {
    const { chainId } = useChainContext({ chainId: options?.chainId })
    const Web3 = useWeb3Connection(pluginID, {
        chainId,
        ...options,
    } as ConnectionOptions<T>)

    return useAsyncRetry(async () => {
        return Web3.getBlockTimestamp()
    }, [Web3])
}
