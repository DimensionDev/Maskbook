import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import { getHub } from '@masknet/web3-providers'
import type { Hub, HubOptions } from '@masknet/web3-providers/types'
import { useNetworkContext } from './useContext.js'

export function useWeb3Hub<T extends NetworkPluginID = NetworkPluginID>(expectedPluginID?: T, options?: HubOptions<T>) {
    const { pluginID } = useNetworkContext(expectedPluginID)
    // eslint-disable-next-line react-compiler/react-compiler
    return useMemo(() => getHub(pluginID, options) as Hub<T>, [pluginID, JSON.stringify(options)])
}
