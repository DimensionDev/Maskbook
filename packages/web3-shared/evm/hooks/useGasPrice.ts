import { useAsyncRetry } from 'react-use'
import { useWeb3 } from '.'

export function useGasPrice() {
    const web3 = useWeb3(true)
    return useAsyncRetry(async () => {
        return web3.eth.getGasPrice()
    }, [web3])
}
