import { useAccount } from './useAccount'
import { useAsyncRetry } from 'react-use'
import { useBalance } from './useBalance'

/**
 * Fetch native token balance from chain
 * @param address
 */
export function useNativeTokenBalance() {
    const account = useAccount()
    const balance = useBalance()
    return useAsyncRetry(async () => {
        if (!account) return undefined
        return balance
    }, [account, balance])
}
