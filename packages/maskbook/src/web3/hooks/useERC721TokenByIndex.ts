import { useAsync } from 'react-use'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import type { ERC721Token } from '../types'
import { useChainId } from './useChainState'

export function useERC721TokenByIndex(token?: ERC721Token, index: number = 0) {
    const chainId = useChainId()
    const erc721Contract = useERC721TokenContract(token?.address ?? '')
    return useAsync(async () => {
        if (!erc721Contract) return
        return erc721Contract.tokenByIndex(index)
    }, [chainId /* re-calc when switch the chain */, erc721Contract, index])
}
