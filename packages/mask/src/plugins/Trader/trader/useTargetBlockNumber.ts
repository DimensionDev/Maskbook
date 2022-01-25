import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { ChainId, useChainId, useWeb3 } from '@masknet/web3-shared-evm'

export function useTargetBlockNumber(targetChainId?: ChainId): AsyncState<number> {
    const chainId = useChainId()
    const web3 = useWeb3({ chainId })
    return useAsync(async () => {
        if (targetChainId === chainId) return undefined
        return web3.eth.getBlockNumber()
    }, [targetChainId, chainId, web3])
}
