import { useAsyncRetry } from 'react-use'
import { useBalanceCheckerContract } from '../contracts/useBalanceChecker'
import { useAccount } from './useAccount'
import { useChainId } from './useChainState'

/**
 * Fetch balance of multiple tokens from chain
 * @param from
 * @param listOfAddress
 */
export function useTokensBalance(listOfAddress: string[]) {
    const account = useAccount()
    const chainId = useChainId()
    const balanceCheckerContract = useBalanceCheckerContract()
    return useAsyncRetry(async () => {
        if (!account || !balanceCheckerContract) return []
        return balanceCheckerContract.balances([account], listOfAddress)
    }, [account, chainId, listOfAddress.join(), balanceCheckerContract])
}
