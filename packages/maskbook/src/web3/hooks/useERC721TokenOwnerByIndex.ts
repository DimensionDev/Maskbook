import { useAsync } from 'react-use'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import type { ERC721Token } from '../types'
import { useAccount } from './useAccount'
import { useChainId } from './useChainState'

export function useERC721TokenOwnerByIndex(token?: ERC721Token, index: number = 0) {
    const account = useAccount()
    const chainId = useChainId()
    const erc721Contract = useERC721TokenContract(token?.address ?? '')
    return useAsync(async () => {
        if (!account || !erc721Contract) return
        return erc721Contract.tokenOfOwnerByIndex(account, index)
    }, [account, chainId /* re-calc when switch the chain */, token, erc721Contract, index])
}
