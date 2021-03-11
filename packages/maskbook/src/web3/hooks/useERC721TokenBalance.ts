import { useAccount } from './useAccount'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useAsyncRetry } from 'react-use'
import { useChainId } from './useChainState'

/**
 * Fetch token balance from chain
 * @param token
 */
export function useERC721TokenBalance(address: string) {
    const chainId = useChainId()
    const account = useAccount()
    const erc721TokenContract = useERC721TokenContract(address)
    return useAsyncRetry(async () => {
        if (!account || !erc721TokenContract) return undefined
        return erc721TokenContract.balanceOf(account)
    }, [account, chainId /* re-calc when switch the chain */, address, erc721TokenContract])
}
