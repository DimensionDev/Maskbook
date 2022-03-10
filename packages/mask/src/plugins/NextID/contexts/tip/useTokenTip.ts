import { rightShift } from '@masknet/web3-shared-base'
import {
    EthereumTokenType,
    FungibleTokenDetailed,
    isSameAddress,
    useTokenConstants,
    useTokenTransferCallback,
} from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import type { TipTuple } from './type'

export function useTokenTip(recipient: string, token: FungibleTokenDetailed | null, amount: string): TipTuple {
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const isNativeToken = isSameAddress(token?.address, NATIVE_TOKEN_ADDRESS)

    const assetType = isNativeToken ? EthereumTokenType.Native : EthereumTokenType.ERC20
    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        assetType,
        token?.address || '',
    )
    const sendTip = useCallback(async () => {
        const transferAmount = rightShift(amount || '0', token?.decimals || 0).toFixed()
        await transferCallback(transferAmount, recipient)
        resetTransferCallback()
    }, [amount, token, recipient, transferCallback, resetTransferCallback])

    return [transferState, sendTip]
}
