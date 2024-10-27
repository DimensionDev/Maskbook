import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import { getConnection } from '@masknet/web3-providers'
import type { Connection, ConnectionOptions } from '@masknet/web3-providers/types'
import { useNetworkContext } from './useContext.js'

export function useWeb3Connection<T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
    options?: ConnectionOptions<T>,
) {
    const { pluginID } = useNetworkContext(expectedPluginID)
    // eslint-disable-next-line react-compiler/react-compiler
    return useMemo(() => getConnection(pluginID, options) as Connection<T>, [pluginID, JSON.stringify(options)])
}
