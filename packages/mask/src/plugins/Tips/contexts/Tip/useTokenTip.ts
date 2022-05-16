import { rightShift, isSameAddress, FungibleToken } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, useTokenConstants, useTokenTransferCallback } from '@masknet/web3-shared-evm'
import { GasConfig } from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import type { TipTuple } from './type'

export function useTokenTip(
    recipient: string,
    token: FungibleToken<ChainId, SchemaType> | null,
    amount: string,
    gasConfig?: GasConfig,
): TipTuple {
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const isNativeToken = isSameAddress(token?.address, NATIVE_TOKEN_ADDRESS)

    const assetType = isNativeToken ? SchemaType.Native : SchemaType.ERC20
    const [transferState, transferCallback] = useTokenTransferCallback(assetType, token?.address || '')

    const sendTip = useCallback(async () => {
        const transferAmount = rightShift(amount || '0', token?.decimals || 0).toFixed()
        await transferCallback(transferAmount, recipient, gasConfig)
    }, [amount, token, recipient, transferCallback, gasConfig])

    return [transferState, sendTip]
}
