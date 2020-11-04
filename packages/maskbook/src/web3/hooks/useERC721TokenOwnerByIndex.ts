import { useAsync } from 'react-use'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { EthereumTokenType, Token } from '../types'
import { useAccount } from './useAccount'
import { useChainId } from './useChainState'

export function useERC721TokenOwnerByIndex(token?: PartialRequired<Token, 'address' | 'type'>, index: number = 0) {
    const chainId = useChainId()
    const account = useAccount()
    const erc721Contract = useERC721TokenContract(token?.address ?? '')
    return useAsync(async () => {
        if (!account) return
        if (!token?.address) return
        if (token.type !== EthereumTokenType.ERC721) return
        if (!erc721Contract) return
        return erc721Contract.methods.tokenOfOwnerByIndex(account, index).call()
    }, [account, chainId /* re-calc when switch the chain */, token, erc721Contract, index])
}
