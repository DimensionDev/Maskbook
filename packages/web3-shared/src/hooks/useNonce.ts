import { useAsyncRetry } from 'react-use'
import { useWeb3Context } from '../context'

export function useNonce(address: string) {
    const { getNonce } = useWeb3Context()
    return useAsyncRetry(async () => {
        return getNonce(address)
    }, [address])
}
