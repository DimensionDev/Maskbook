import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import { getUtils } from '@masknet/web3-providers'
import type { Utils } from '@masknet/web3-providers/types'
import { useNetworkContext } from './useContext.js'

export function useWeb3Utils<T extends NetworkPluginID = NetworkPluginID>(expectedPluginID?: T) {
    const { pluginID } = useNetworkContext(expectedPluginID)
    return useMemo(() => getUtils(pluginID) as Utils<T>, [pluginID])
}
