import { EthereumTokenType, useTokenTransferCallback } from '@masknet/web3-shared-evm'
import { useCallback, useContext } from 'react'
import { TipContext } from './TipContext'
import type { TipTuple } from './type'

export function useNftTip(): TipTuple {
    const context = useContext(TipContext)
    const { recipient, erc721TokenId, erc721Contract } = context

    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        EthereumTokenType.ERC721,
        erc721Contract?.address || '',
    )
    const sendTip = useCallback(async () => {
        if (!erc721TokenId) return
        await transferCallback(erc721TokenId, recipient)
        resetTransferCallback()
    }, [erc721TokenId, recipient, transferCallback, resetTransferCallback])

    return [transferState, sendTip]
}
