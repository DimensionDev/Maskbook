import { useAsyncRetry } from 'react-use'

export function useAccount() {
    return useAsyncRetry(async () => {
        return '0x000000000'
    }, [])
}
