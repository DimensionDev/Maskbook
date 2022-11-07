import { useAsyncRetry } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { PluginITO_RPC } from '../../messages.js'

export function usePoolPayload(pid: string) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    return useAsyncRetry(async () => {
        if (!pid) return
        return PluginITO_RPC.getPool(pid, chainId)
    }, [pid, chainId])
}
