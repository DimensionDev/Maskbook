import { useAsyncRetry } from 'react-use'
import { useChainId, useWeb3 } from '.'
import type { ChainId } from '..'

/**
 * Get the current block number of current chain
 */
export function useBlockNumber(expectedChainId?: ChainId) {
    const defaultChainId = useChainId()
    const web3 = useWeb3({ chainId: expectedChainId ?? defaultChainId })

    return useAsyncRetry(async () => {
        return web3.eth.getBlockNumber()
    }, [web3])
}
