import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Web3 } from '@masknet/web3-providers'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export function useTargetBlockNumber(targetChainId?: Web3Helper.ChainIdAll): AsyncState<number> {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: targetChainId as ChainId,
    })
    return useAsync(async () => {
        if (targetChainId === chainId) return
        return Web3.getBlockNumber({
            chainId: targetChainId as ChainId,
        })
    }, [chainId, targetChainId])
}
