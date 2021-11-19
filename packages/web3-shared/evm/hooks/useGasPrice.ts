import { useAsyncRetry } from 'react-use'
import { useWeb3 } from './useWeb3'

export function useGasPrice() {
    const web3 = useWeb3()
    return useAsyncRetry(async () => {
        return web3.eth.getGasPrice()
    }, [web3])
}
