import { useMemo } from 'react'
import { NetworkPluginID, isGreaterThan, isLessThanOrEqualTo, rightShift, TokenType } from '@masknet/web3-shared-base'
import { useChainContext, useNetworkContext, useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { useI18N } from '../../locales/index.js'
import type { ValidationTuple } from '../../types/index.js'
import type { TipContextOptions } from './TipContext.js'

type TipValidateOptions = Pick<
    TipContextOptions,
    'tipType' | 'amount' | 'token' | 'nonFungibleTokenId' | 'nonFungibleTokenAddress' | 'isAvailableGasBalance'
>

export function useTipValidate({
    tipType,
    amount,
    token,
    nonFungibleTokenId: tokenId,
    nonFungibleTokenAddress: tokenAddress,
    isAvailableGasBalance,
}: TipValidateOptions): ValidationTuple {
    const { account, chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const { value: balance = '0' } = useFungibleTokenBalance(pluginID, token?.address, { chainId, account })
    const t = useI18N()

    const result: ValidationTuple = useMemo(() => {
        if (tipType === TokenType.Fungible) {
            if (!isAvailableGasBalance) {
                return [false, t.no_enough_gas_fees()]
            }
            if (!amount || isLessThanOrEqualTo(amount, 0)) return [false]
            if (isGreaterThan(rightShift(amount, token?.decimals), balance))
                return [false, t.token_insufficient_balance()]
        } else if (pluginID === NetworkPluginID.PLUGIN_EVM) {
            if (!tokenId || !tokenAddress) return [false]
        } else if (pluginID === NetworkPluginID.PLUGIN_SOLANA && !tokenAddress) {
            return [false]
        }
        return [true]
    }, [tipType, amount, token?.decimals, balance, pluginID, tokenId, tokenAddress, t, isAvailableGasBalance])

    return result
}
