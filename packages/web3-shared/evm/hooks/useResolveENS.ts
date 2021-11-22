import { useAsyncRetry } from 'react-use'
import { ChainId } from '../types'
import { useWeb3 } from './useWeb3'

export function useResolveENS(name: string) {
    const web3 = useWeb3(true, ChainId.Mainnet)

    return useAsyncRetry(async () => {
        if (!name) return
        return web3.eth.ens.getAddress(name)
    }, [web3, name])
}
