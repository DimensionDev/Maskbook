import { EMPTY_LIST } from '@masknet/utils'
import { useAsyncRetry } from 'react-use'
import { numberToHex } from 'web3-utils'
import { useBalanceCheckerContract } from '../contracts/useBalanceChecker'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import type { ChainId } from '../types'

/**
 * Fetch balance of multiple tokens from chain
 * @param listOfAddress
 * @param targetChainId
 */
export function useTokensBalance(listOfAddress: string[], targetChainId?: ChainId) {
    const currentChainId = useChainId()
    const chainId = targetChainId ?? currentChainId
    const account = useAccount()
    const balanceCheckerContract = useBalanceCheckerContract(chainId)

    return useAsyncRetry(async () => {
        if (!account || !balanceCheckerContract || !listOfAddress.length) return EMPTY_LIST
        return balanceCheckerContract.methods.balances([account], listOfAddress).call({
            // cannot check the sender's balance in the same contract
            from: undefined,
            chainId: numberToHex(chainId),
        })
    }, [chainId, account, listOfAddress.join(), balanceCheckerContract])
}
