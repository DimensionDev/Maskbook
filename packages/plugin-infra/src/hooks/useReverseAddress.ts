import type { NetworkPluginID } from '../web3-types'
import { useChainId, useWeb3State } from '../web3'
import { useAsync } from 'react-use'

export function useReverseAddress(address?: string, pluginId?: NetworkPluginID) {
    const { NameService } = useWeb3State(pluginId)

    const chainId = useChainId(pluginId)

    return useAsync(async () => {
        if (!address) return undefined
        return NameService?.reverse?.(address)
    }, [NameService, address, chainId])
}
