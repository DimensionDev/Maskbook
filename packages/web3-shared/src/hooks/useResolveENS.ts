import { useAsyncRetry } from 'react-use'
import { useChainId } from '.'
import { useWeb3 } from './useWeb3'

export function useResolveENS(name: string) {
    const web3 = useWeb3()
    const chainId = useChainId()

    return useAsyncRetry(async () => {
        const result = await web3.eth.ens.getAddress(name)
        return result
    }, [web3, name, chainId])
}
