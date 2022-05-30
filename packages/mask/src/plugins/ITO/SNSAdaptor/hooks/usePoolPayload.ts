import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { PluginITO_RPC } from '../../messages'

export function usePoolPayload(pid: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(async () => {
        if (!pid) return
        return PluginITO_RPC.getPool(pid, chainId)
    }, [pid, chainId])
}
