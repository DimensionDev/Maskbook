import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export function useTargetBlockNumber(targetChainId?: Web3Helper.ChainIdAll): AsyncState<number> {
    const { chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const connection = useWeb3Connection(pluginID, { chainId: targetChainId })
    return useAsync(async () => {
        if (targetChainId === chainId || !connection) return
        return connection.getBlockNumber()
    }, [targetChainId, chainId, connection])
}
