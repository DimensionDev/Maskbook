import { useAsyncRetry } from 'react-use'
import { useAccount } from './useAccount'
import { useBalance } from './useBalance'

/**
 * Fetch native token balance from chain
 * @param address
 */
export function useNativeTokenBalance() {
    const account = useAccount()
    const { value: balance = '0' } = useBalance()
    return useAsyncRetry(async () => {
        if (!account) return
        return balance
    }, [account, balance])
}
