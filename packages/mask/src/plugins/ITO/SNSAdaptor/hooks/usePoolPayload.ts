import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { PluginITO_RPC } from '../../messages.js'

export function usePoolPayload(pid: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(async () => {
        if (!pid) return
        return PluginITO_RPC.getPool(pid, chainId)
    }, [pid, chainId])
}
