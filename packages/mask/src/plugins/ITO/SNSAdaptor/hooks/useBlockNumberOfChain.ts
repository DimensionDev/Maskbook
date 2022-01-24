import { useAsync } from 'react-use'
import type { ChainId } from '@masknet/web3-shared-evm'
import Services from '../../../../extension/service'

/**
 * Get the current block number of specified chain
 */
export function useBlockNumberOfChain(chainId: ChainId) {
    return useAsync(
        async () =>
            Services.Ethereum.getBlockNumber({
                chainId,
            }),
        [chainId],
    )
}
