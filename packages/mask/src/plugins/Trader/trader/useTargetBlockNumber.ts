import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { ChainId, useChainId } from '@masknet/web3-shared-evm'
import Services from '../../../extension/service'

export function useTargetBlockNumber(targetChainId?: ChainId): AsyncState<number> {
    const chainId = useChainId()
    return useAsync(async () => {
        if (targetChainId === chainId) return undefined
        return Services.Ethereum.getBlockNumber({
            chainId: targetChainId,
        })
    }, [targetChainId, chainId])
}
