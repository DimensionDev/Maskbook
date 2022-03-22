import { ERC721ContractDetailed, EthereumTokenType, useTokenTransferCallback } from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import type { TipTuple } from './type'

export function useNftTip(
    recipient: string,
    tokenId: string | null,
    contract: ERC721ContractDetailed | null,
): TipTuple {
    const [transferState, transferCallback] = useTokenTransferCallback(
        EthereumTokenType.ERC721,
        contract?.address || '',
    )

    const sendTip = useCallback(async () => {
        if (!tokenId) return
        await transferCallback(tokenId, recipient)
    }, [tokenId, recipient, transferCallback])

    return [transferState, sendTip]
}
