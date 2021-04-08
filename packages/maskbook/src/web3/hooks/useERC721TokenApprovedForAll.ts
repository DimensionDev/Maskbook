import { useAsyncRetry } from 'react-use'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useAccount } from './useAccount'
import { useChainId } from './useChainState'

export function useERC721TokenApprovedForAll(address: string, spender?: string) {
    const account = useAccount()
    const chainId = useChainId()
    const erc721Contract = useERC721TokenContract(address)
    return useAsyncRetry(async () => {
        if (!account || !spender || !erc721Contract) return false
        return erc721Contract.methods.isApprovedForAll(account, spender).call()
    }, [account, chainId /* re-calc when switch the chain */, spender, erc721Contract])
}
