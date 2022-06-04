import { useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import { useTokenTransferCallback } from '@masknet/plugin-infra/web3-evm'
import { FungibleToken, isSameAddress, rightShift } from '@masknet/web3-shared-base'
import { GasConfig, SchemaType, useTokenConstants } from '@masknet/web3-shared-evm'
import { useCallback } from 'react'
import type { TipTuple } from './type'

export function useTokenTip(
    recipient: string,
    token: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null,
    amount: string,
    gasConfig?: GasConfig,
): TipTuple {
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const isNativeToken = isSameAddress(token?.address, NATIVE_TOKEN_ADDRESS)

    const assetType = isNativeToken ? SchemaType.Native : SchemaType.ERC20
    const { Connection } = useWeb3State()
    const transfer = useCallback(async () => {
        const connection = await Connection?.getConnection?.()
        if (!token?.address || !connection) return
        connection.transferFungibleToken(token?.address, recipient, amount)
    }, [])

    const [{ loading: isTransferring }, transferCallback] = useTokenTransferCallback(assetType, token?.address || '')

    const sendTip = useCallback(async () => {
        const transferAmount = rightShift(amount || '0', token?.decimals || 0).toFixed()
        return transferCallback(transferAmount, recipient, gasConfig)
    }, [amount, token, recipient, transferCallback, gasConfig])

    return [isTransferring, sendTip]
}
