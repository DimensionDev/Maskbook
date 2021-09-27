import { useWallet } from './useWallet'
import { useWeb3State } from '../context'
import { useChainId } from './useChainId'

export function useERC721Tokens() {
    const chainId = useChainId()
    const erc721Tokens = useWeb3State().erc721Tokens
    const wallet = useWallet()

    if (!wallet) return []
    return erc721Tokens.filter((x) => x.contractDetailed.chainId === chainId)
}
