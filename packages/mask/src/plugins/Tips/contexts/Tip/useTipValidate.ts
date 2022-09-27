import { useAccount, useFungibleTokenBalance } from '@masknet/plugin-infra/web3'
import { isGreaterThan, isLessThanOrEqualTo, NetworkPluginID, rightShift } from '@masknet/web3-shared-base'
import { useMemo } from 'react'
import { useI18N } from '../../locales/index.js'
import { TipsType, ValidationTuple } from '../../types'
import { TargetRuntimeContext } from '../TargetRuntimeContext.js'
import type { TipContextOptions } from './TipContext.js'

type TipValidateOptions = Pick<
    TipContextOptions,
    'tipType' | 'amount' | 'token' | 'nonFungibleTokenId' | 'nonFungibleTokenAddress'
>

export function useTipValidate({
    tipType,
    amount,
    token,
    nonFungibleTokenId: tokenId,
    nonFungibleTokenAddress: tokenAddress,
}: TipValidateOptions): ValidationTuple {
    const account = useAccount()
    const { pluginId, targetChainId: chainId } = TargetRuntimeContext.useContainer()
    const { value: balance = '0' } = useFungibleTokenBalance(pluginId, token?.address, { chainId, account })
    const t = useI18N()

    const result: ValidationTuple = useMemo(() => {
        if (tipType === TipsType.Tokens) {
            if (!amount || isLessThanOrEqualTo(amount, 0)) return [false]
            if (isGreaterThan(rightShift(amount, token?.decimals), balance))
                return [false, t.token_insufficient_balance()]
        } else if (pluginId === NetworkPluginID.PLUGIN_EVM) {
            if (!tokenId || !tokenAddress) return [false]
        } else if (!tokenId) {
            return [false]
        }
        return [true]
    }, [tipType, amount, token?.decimals, balance, pluginId, tokenId, tokenAddress, t])

    return result
}
