import {
    ERC721ContractDetailed,
    EthereumTokenType,
    TransactionStateType,
    useTokenTransferCallback,
} from '@masknet/web3-shared-evm'
import { useCallback, useEffect } from 'react'
import type { TipTuple } from './type'

export function useNftTip(
    recipient: string,
    tokenId: string | null,
    contract: ERC721ContractDetailed | null,
): TipTuple {
    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        EthereumTokenType.ERC721,
        contract?.address || '',
    )
    useEffect(() => {
        if (transferState.type !== TransactionStateType.CONFIRMED) {
            return
        }
        resetTransferCallback()
    }, [transferState.type, resetTransferCallback])

    const sendTip = useCallback(async () => {
        if (!tokenId) return
        await transferCallback(tokenId, recipient)
    }, [tokenId, recipient, transferCallback])

    return [transferState, sendTip]
}
