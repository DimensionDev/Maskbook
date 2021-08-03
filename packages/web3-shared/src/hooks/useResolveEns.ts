import { useAsyncRetry } from 'react-use'
import { useWeb3 } from './useWeb3'

export function useResolveEns(name: string) {
    const web3 = useWeb3()

    return useAsyncRetry(async () => {
        const result = await web3.eth.ens.getAddress(name)
        return result
    }, [name])
}
