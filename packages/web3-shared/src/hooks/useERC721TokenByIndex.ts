import { useAsync } from 'react-use'
import type { ERC721Token } from '../types'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useChainId } from './useChainId'

export function useERC721TokenByIndex(token?: ERC721Token, index: number = 0) {
    const chainId = useChainId()
    const erc721Contract = useERC721TokenContract(token?.address ?? '')
    return useAsync(async () => {
        if (!erc721Contract) return
        return erc721Contract.methods.tokenByIndex(index).call()
    }, [chainId, erc721Contract, index])
}
