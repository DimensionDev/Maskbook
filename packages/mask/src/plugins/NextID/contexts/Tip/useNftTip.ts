import { EthereumTokenType, useTokenTransferCallback } from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import { deleteToken } from '../../storage'
import type { TipTuple } from './type'

export function useNftTip(recipient: string, tokenId: string | null, contractAddress?: string): TipTuple {
    const [transferState, transferCallback] = useTokenTransferCallback(EthereumTokenType.ERC721, contractAddress || '')

    const sendTip = useCallback(async () => {
        if (!tokenId || !contractAddress) return
        await transferCallback(tokenId, recipient)
        deleteToken(contractAddress, tokenId)
    }, [tokenId, contractAddress, recipient, transferCallback])

    return [transferState, sendTip]
}
