import { useBalanceCheckerContract } from '../contracts/useBalanceChecker'
import { useAsync } from 'react-use'
import { useConstant } from './useConstant'
import { CONSTANTS } from '../constants'

export function useTokensBalance(account: string, listOfAddress: string[]) {
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const balanceCheckerContract = useBalanceCheckerContract()
    return useAsync(async () => {
        if (!account || !listOfAddress.length) return [] as string[]
        return balanceCheckerContract.methods.balances([account], listOfAddress).call({
            // cannot check the sender's balance in the same contract
            from: ETH_ADDRESS,
        })
    }, [account, listOfAddress.join()])
}
