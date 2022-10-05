import { useAsyncRetry } from 'react-use'

import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useGasPrice<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const connection = useWeb3Connection(pluginID, options)
    return useAsyncRetry(async () => {
        if (!connection) return '0'
        return connection.getGasPrice() ?? '0'
    }, [connection])
}
