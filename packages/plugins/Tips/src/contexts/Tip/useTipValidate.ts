import { useMemo } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { isGreaterThan, isLessThanOrEqualTo, rightShift } from '@masknet/web3-shared-base'
import type { ValidationTuple } from '../../types/index.js'
import type { TipContextOptions } from './TipContext.js'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'

type TipValidateOptions = Pick<TipContextOptions, 'tipType' | 'amount' | 'token' | 'isGasSufficient'>

export function useTipValidate(
    pluginID: NetworkPluginID,
    chainId: Web3Helper.ChainIdAll,
    { amount, token, isGasSufficient }: TipValidateOptions,
): ValidationTuple {
    const { _ } = useLingui()
    const { account } = useChainContext()

    const { data: balance = '0' } = useFungibleTokenBalance(pluginID, token?.address, { chainId, account })

    const result: ValidationTuple = useMemo(() => {
        if (!isGasSufficient) {
            return [false, _(msg`No Enough Gas Fees`)]
        }
        if (!amount || isLessThanOrEqualTo(amount, 0)) return [false]
        if (isGreaterThan(rightShift(amount, token?.decimals), balance)) return [false, _(msg`Insufficient balance`)]
        return [true]
    }, [amount, token?.decimals, balance, _, isGasSufficient])

    return result
}
