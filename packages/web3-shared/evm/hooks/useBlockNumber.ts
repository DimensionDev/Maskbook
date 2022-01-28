import { useAsyncRetry } from 'react-use'
import { useChainId, useWeb3 } from '.'
import type { ChainId } from '..'
import pThrottle from 'p-throttle'

const throttle = pThrottle({
    limit: 1,
    interval: 5000,
})

/**
 * Get the current block number of current chain
 */
export function useBlockNumber(expectedChainId?: ChainId) {
    const defaultChainId = useChainId()
    const web3 = useWeb3({ chainId: expectedChainId ?? defaultChainId })
    const throttleFn = throttle(() => web3.eth.getBlockNumber())

    return useAsyncRetry(async () => {
        return throttleFn()
    }, [web3])
}
