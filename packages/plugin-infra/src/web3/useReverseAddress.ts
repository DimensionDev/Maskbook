import { useAsync } from 'react-use'
import type { NetworkPluginID } from '../web3-types'
import { useChainId, useWeb3State } from '.'

export function useReverseAddress(pluginId?: NetworkPluginID, address?: string) {
    const chainId = useChainId(pluginId)
    const { NameService, Utils } = useWeb3State(pluginId)

    return useAsync(async () => {
        return address && Utils?.isValidAddress?.(address) ? NameService?.reverse?.(chainId, address) : undefined
    }, [NameService, address, chainId])
}
