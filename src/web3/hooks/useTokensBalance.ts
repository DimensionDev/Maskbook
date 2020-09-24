import { useBalanceCheckerContract } from '../contracts/useBalanceChecker'
import { useAsync } from 'react-use'

export function useTokensBalance(account: string, tokens: string[]) {
    const balanceCheckerContract = useBalanceCheckerContract()
    return useAsync(async () => {
        if (!account || !tokens.length) return [] as string[]
        return balanceCheckerContract.methods.balances([account], tokens).call()
    }, [account, tokens.join()])
}
