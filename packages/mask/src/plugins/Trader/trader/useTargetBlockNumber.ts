import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useChainId, useWeb3 } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useTargetBlockNumber(targetChainId?: ChainId): AsyncState<number> {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })
    return useAsync(async () => {
        if (targetChainId === chainId) return
        return web3?.eth.getBlockNumber()
    }, [targetChainId, chainId, web3])
}
