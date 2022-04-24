import { useAsync } from 'react-use'
import type { NetworkPluginID } from '../web3-types'
import { useChainId, useWeb3State } from '.'

export function useReverseAddress<T extends NetworkPluginID>(pluginId?: T, address?: string) {
    const chainId = useChainId(pluginId)
    const { NameService, Utils } = useWeb3State(pluginId)

    return useAsync(async () => {
        // @ts-ignore
        return address && Utils?.isValidAddress?.(address) ? NameService?.reverse?.(chainId, address) : undefined
    }, [address, chainId, NameService])
}
