import { useAsync } from 'react-use'
import type { ERC721Token } from '../types'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'

export function useERC721TokenOwnerByIndex(token?: ERC721Token, index: number = 0) {
    const account = useAccount()
    const chainId = useChainId()
    const erc721Contract = useERC721TokenContract(token?.address ?? '')
    return useAsync(async () => {
        if (!account || !erc721Contract) return
        return erc721Contract.methods.tokenOfOwnerByIndex(account, index).call()
    }, [account, chainId, token, erc721Contract, index])
}
