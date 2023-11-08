import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import { getOthersAPI } from '@masknet/web3-providers'
import type { Others } from '@masknet/web3-providers/types'
import { useNetworkContext } from './useContext.js'

export function useWeb3Others<T extends NetworkPluginID = NetworkPluginID>(expectedPluginID?: T) {
    const { pluginID } = useNetworkContext(expectedPluginID)
    return useMemo(() => getOthersAPI(pluginID) as Others<T>, [pluginID])
}
