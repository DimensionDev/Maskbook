import { useTokenTransferCallback } from '@masknet/web3-shared-evm'
import { ERC721ContractDetailed, Web3TokenType } from '@masknet/web3-shared-base'
import { useCallback } from 'react'
import type { TipTuple } from './type'

export function useNftTip(
    recipient: string,
    tokenId: string | null,
    contract: ERC721ContractDetailed | null,
): TipTuple {
    const [transferState, transferCallback] = useTokenTransferCallback(Web3TokenType.ERC721, contract?.address || '')

    const sendTip = useCallback(async () => {
        if (!tokenId) return
        await transferCallback(tokenId, recipient)
    }, [tokenId, recipient, transferCallback])

    return [transferState, sendTip]
}
