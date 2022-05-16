<<<<<<< HEAD:packages/mask/src/plugins/NextID/contexts/Tip/useTokenTip.ts
import { rightShift, isSameAddress, FungibleToken } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, useTokenConstants, useTokenTransferCallback } from '@masknet/web3-shared-evm'
=======
import { rightShift } from '@masknet/web3-shared-base'
import {
    EthereumTokenType,
    FungibleTokenDetailed,
    GasConfig,
    isSameAddress,
    useTokenConstants,
    useTokenTransferCallback,
} from '@masknet/web3-shared-evm'
>>>>>>> develop:packages/mask/src/plugins/Tips/contexts/Tip/useTokenTip.ts
import { useCallback } from 'react'
import type { TipTuple } from './type'

export function useTokenTip(
    recipient: string,
<<<<<<< HEAD:packages/mask/src/plugins/NextID/contexts/Tip/useTokenTip.ts
    token: FungibleToken<ChainId, SchemaType> | null,
    amount: string,
=======
    token: FungibleTokenDetailed | null,
    amount: string,
    gasConfig?: GasConfig,
>>>>>>> develop:packages/mask/src/plugins/Tips/contexts/Tip/useTokenTip.ts
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
