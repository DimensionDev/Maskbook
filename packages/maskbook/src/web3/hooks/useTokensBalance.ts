import { useAsync } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { useBalanceCheckerContract } from '../contracts/useBalanceChecker'

/**
 * Fetch tokens balance from chain
 * @param from
 * @param listOfAddress
 */
export function useTokensBalance(from: string, listOfAddress: string[]) {
    const balanceCheckerContract = useBalanceCheckerContract()
    return useAsync(async () => {
        if (!EthereumAddress.isValid(from)) return []
        if (!listOfAddress.length) return []
        if (!balanceCheckerContract) return []
        return balanceCheckerContract.methods.balances([from], listOfAddress).call({
            // cannot check the sender's balance in the same contract
            from: undefined,
        })
    }, [from, listOfAddress.join(), balanceCheckerContract])
}
