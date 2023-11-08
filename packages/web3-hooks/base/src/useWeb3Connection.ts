import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import { getWeb3Connection } from '@masknet/web3-providers'
import type { Connection, ConnectionOptions } from '@masknet/web3-providers/types'
import { useNetworkContext } from './useContext.js'

export function useWeb3Connection<T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
    options?: ConnectionOptions<T>,
) {
    const { pluginID } = useNetworkContext(expectedPluginID)
    return useMemo(() => getWeb3Connection(pluginID, options) as Connection<T>, [pluginID, JSON.stringify(options)])
}
