import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useChainId, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

export function useTargetBlockNumber(targetChainId?: ChainId): AsyncState<number> {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId: targetChainId })
    return useAsync(async () => {
        if (targetChainId === chainId || !connection) return
        return connection.getBlockNumber()
    }, [targetChainId, chainId, connection])
}
