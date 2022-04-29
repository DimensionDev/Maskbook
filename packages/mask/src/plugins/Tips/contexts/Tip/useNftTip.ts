import {
    EthereumTokenType,
    useERC721ContractDetailed,
    useERC721TokenDetailedCallback,
    useTokenTransferCallback,
} from '@masknet/web3-shared-evm'
import { useCallback, useEffect } from 'react'
import { WalletRPC } from '../../../Wallet/messages'
import type { TipTuple } from './type'

export function useNftTip(recipient: string, tokenId: string | null, contractAddress?: string): TipTuple {
    const [isTransferring, transferCallback] = useTokenTransferCallback(EthereumTokenType.ERC721, contractAddress || '')
    const { value: contractDetailed } = useERC721ContractDetailed(contractAddress)
    const [, setTokenId, erc721TokenDetailedCallback] = useERC721TokenDetailedCallback(contractDetailed)

    useEffect(() => {
        if (tokenId) {
            setTokenId(tokenId)
        }
    }, [tokenId])

    const sendTip = useCallback(async () => {
        if (!tokenId || !contractAddress) return
        const hash = await transferCallback(tokenId, recipient)
        const tokenDetailed = await erc721TokenDetailedCallback()
        if (tokenDetailed) {
            await WalletRPC.removeToken(tokenDetailed)
        }
        return hash
    }, [tokenId, contractAddress, erc721TokenDetailedCallback, recipient, transferCallback])

    return [isTransferring, sendTip]
}
