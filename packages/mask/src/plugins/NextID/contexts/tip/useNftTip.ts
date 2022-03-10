import { EthereumTokenType, TransactionStateType, useTokenTransferCallback } from '@masknet/web3-shared-evm'
import { useCallback, useContext, useEffect } from 'react'
import { TipContext } from './TipContext'
import type { TipTuple } from './type'

export function useNftTip(): TipTuple {
    const context = useContext(TipContext)
    const { recipient, erc721TokenId, erc721Contract } = context

    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        EthereumTokenType.ERC721,
        erc721Contract?.address || '',
    )
    useEffect(() => {
        if (transferState.type === TransactionStateType.CONFIRMED) {
            resetTransferCallback()
        }
    }, [transferState.type, resetTransferCallback])

    const sendTip = useCallback(async () => {
        if (!erc721TokenId) return
        await transferCallback(erc721TokenId, recipient)
    }, [erc721TokenId, recipient, transferCallback, resetTransferCallback])

    return [transferState, sendTip]
}
