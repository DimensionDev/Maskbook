import { EthereumAddress } from 'wallet.ts'
import { useBalanceCheckerContract } from '../contracts/useBalanceChecker'
import { useAsync } from 'react-use'
import { useConstant } from './useConstant'
import { CONSTANTS } from '../constants'

/**
 * Fetch tokens balance from chain
 * @param address
 * @param listOfAddress
 */
export function useTokensBalance(address: string, listOfAddress: string[]) {
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const balanceCheckerContract = useBalanceCheckerContract()
    return useAsync(async () => {
        if (!EthereumAddress.isValid(address)) return []
        if (!listOfAddress.length) return []
        return balanceCheckerContract.methods.balances([address], listOfAddress).call({
            // cannot check the sender's balance in the same contract
            from: ETH_ADDRESS,
        })
    }, [address, listOfAddress.join()])
}
