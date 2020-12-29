import { useAsync } from 'react-use'
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
    return useAsync(async () => {
        if (!account || !balanceCheckerContract) return []
        return balanceCheckerContract.methods.balances([account], listOfAddress).call({
            // cannot check the sender's balance in the same contract
            from: undefined,
        })
    }, [account, chainId, listOfAddress.join(), balanceCheckerContract])
}
