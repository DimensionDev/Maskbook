import { rightShift } from '@masknet/web3-shared-base'
import {
    EthereumTokenType,
    FungibleTokenDetailed,
    GasConfig,
    isSameAddress,
    useTokenConstants,
    useTokenTransferCallback,
} from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import type { TipTuple } from './type'

export function useTokenTip(
    recipient: string,
    token: FungibleTokenDetailed | null,
    amount: string,
    gasConfig?: GasConfig,
): TipTuple {
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const isNativeToken = isSameAddress(token?.address, NATIVE_TOKEN_ADDRESS)

    const assetType = isNativeToken ? EthereumTokenType.Native : EthereumTokenType.ERC20
    const [isTransfering, transferCallback] = useTokenTransferCallback(assetType, token?.address || '')

    const sendTip = useCallback(async () => {
        const transferAmount = rightShift(amount || '0', token?.decimals || 0).toFixed()
        return transferCallback(transferAmount, recipient, gasConfig)
    }, [amount, token, recipient, transferCallback, gasConfig])

    return [isTransfering, sendTip]
}
