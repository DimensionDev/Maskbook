import { useAsyncRetry } from 'react-use'
import { useBalanceCheckerContract } from '../contracts/useBalanceChecker'
import { useAccount } from './useAccount'

/**
 * Fetch balance of multiple tokens from chain
 * @param from
 * @param listOfAddress
 */
export function useTokensBalance(listOfAddress: string[]) {
    const account = useAccount()
    const balanceCheckerContract = useBalanceCheckerContract()

    return useAsyncRetry(async () => {
        if (!account || !balanceCheckerContract || !listOfAddress.length) return []
        return balanceCheckerContract.methods.balances([account], listOfAddress).call({
            // cannot check the sender's balance in the same contract
            from: undefined,
        })
    }, [account, listOfAddress.join(), balanceCheckerContract])
}
