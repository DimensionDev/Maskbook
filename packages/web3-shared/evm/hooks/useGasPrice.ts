import { useAsyncRetry } from 'react-use'
import { useWeb3 } from './useWeb3'
import { useChainId } from './useChainId'
import type { ChainId } from '../types'

export function useGasPrice(expertedChainId?: ChainId) {
    const currentChainId = useChainId()
    const chainId = expertedChainId ?? currentChainId
    const web3 = useWeb3({ chainId })

    return useAsyncRetry(async () => {
        return web3.eth.getGasPrice()
    }, [web3, chainId])
}
