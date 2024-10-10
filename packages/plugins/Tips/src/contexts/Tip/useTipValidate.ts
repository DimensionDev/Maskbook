import { useMemo } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { isGreaterThan, isLessThanOrEqualTo, rightShift, TokenType } from '@masknet/web3-shared-base'
import type { ValidationTuple } from '../../types/index.js'
import type { TipContextOptions } from './TipContext.js'
import { msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

type TipValidateOptions = Pick<
    TipContextOptions,
    'tipType' | 'amount' | 'token' | 'nonFungibleTokenId' | 'nonFungibleTokenAddress' | 'isGasSufficient'
>

export function useTipValidate(
    pluginID: NetworkPluginID,
    chainId: Web3Helper.ChainIdAll,
    {
        tipType,
        amount,
        token,
        nonFungibleTokenId: tokenId,
        nonFungibleTokenAddress: tokenAddress,
        isGasSufficient,
    }: TipValidateOptions,
): ValidationTuple {
    const { _ } = useLingui()
    const { account } = useChainContext()

    const { data: balance = '0' } = useFungibleTokenBalance(pluginID, token?.address, { chainId, account })

    const result: ValidationTuple = useMemo(() => {
        if (tipType === TokenType.Fungible) {
            if (!isGasSufficient) {
                return [false, _(msg`No Enough Gas Fees`)]
            }
            if (!amount || isLessThanOrEqualTo(amount, 0)) return [false]
            if (isGreaterThan(rightShift(amount, token?.decimals), balance))
                return [false, _(msg`Insufficient balance`)]
        } else if (pluginID === NetworkPluginID.PLUGIN_EVM) {
            if (!tokenId || !tokenAddress) return [false]
        } else if (pluginID === NetworkPluginID.PLUGIN_SOLANA && !tokenAddress) {
            return [false]
        }
        return [true]
    }, [tipType, amount, token?.decimals, balance, pluginID, tokenId, tokenAddress, _, isGasSufficient])

    return result
}
