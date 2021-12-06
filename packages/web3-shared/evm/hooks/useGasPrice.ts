import { useAsyncRetry } from 'react-use'
import { useWeb3 } from './useWeb3'
import { useChainId } from './useChainId'

export function useGasPrice() {
    const chainId = useChainId()
    const web3 = useWeb3(true, chainId)

    return useAsyncRetry(async () => {
        return web3.eth.getGasPrice()
    }, [web3, chainId])
}
