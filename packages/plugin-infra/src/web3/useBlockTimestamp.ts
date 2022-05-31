import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useChainId } from './useChainId'
import { useWeb3Connection } from './useWeb3Connection'

export function useBlockTimestamp<T extends NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    type GetBlockTimestamp = (options?: Web3Helper.Web3ConnectionOptions<T>) => Promise<number>

    const chainId = useChainId(pluginID, options?.chainId)
    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!connection) return 0
        return (connection.getBlockTimestamp as GetBlockTimestamp)()
    }, [chainId, connection])
}
