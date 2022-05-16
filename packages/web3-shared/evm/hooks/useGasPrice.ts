import { useAsyncRetry } from 'react-use'
import { useWeb3 } from './useWeb3'
import { useChainId } from './useChainId'
import type { ChainId } from '../types'

export function useGasPrice(expertedChainId?: ChainId) {
    const currentChainId = useChainId()
    const chainId = expertedChainId ?? currentChainId
    const optimism = currentChainId === 10
    const web3 = useWeb3({ chainId })
    const getGasPrice = optimism ? 15000000 : web3.eth.getGasPrice()

    return useAsyncRetry(async () => {
        return getGasPrice
    }, [web3, chainId])
}
