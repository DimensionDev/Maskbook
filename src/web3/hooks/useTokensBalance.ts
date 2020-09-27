import { useBalanceCheckerContract } from '../contracts/useBalanceChecker'
import { useAsync } from 'react-use'

export function useTokensBalance(account: string, listOfAddress: string[]) {
    const balanceCheckerContract = useBalanceCheckerContract()
    return useAsync(async () => {
        if (!account || !listOfAddress.length) return [] as string[]
        return balanceCheckerContract.methods.balances([account], listOfAddress).call()
    }, [account, listOfAddress.join()])
}
