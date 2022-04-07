import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import type { ChainId } from '../types'
import { useAccount } from './useAccount'
import { useBalance } from './useBalance'

/**
 * Fetch native token balance from chain
 */
export function useNativeTokenBalance(chainId?: ChainId): AsyncStateRetry<string> {
    const account = useAccount()
    const { value: balance = '0' } = useBalance(chainId)
    return useAsyncRetry(async () => {
        if (!account) return
        return balance
    }, [account, balance])
}
