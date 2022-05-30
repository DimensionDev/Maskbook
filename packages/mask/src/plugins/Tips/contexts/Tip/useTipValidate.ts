import { useFungibleTokenBalance } from '@masknet/plugin-infra/web3'
import { isGreaterThan, isLessThanOrEqualTo, NetworkPluginID, rightShift } from '@masknet/web3-shared-base'
import { useContext, useMemo } from 'react'
import { useI18N } from '../../locales'
import { TipType } from '../../types'
import { TipContext } from './TipContext'

type ValidationTuple = [isValid: boolean, message?: string]

export function useTipValidate(): ValidationTuple {
    const { tipType, amount, token, erc721TokenId, erc721Address } = useContext(TipContext)
    const { value: balance = '0' } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, token?.address)
    const t = useI18N()

    const result: ValidationTuple = useMemo(() => {
        if (tipType === TipType.Token) {
            if (!amount || isLessThanOrEqualTo(amount, 0)) return [false]
            if (isGreaterThan(rightShift(amount, token?.decimals), balance))
                return [false, t.token_insufficient_balance()]
        } else {
            if (!erc721TokenId || !erc721Address) return [false]
        }
        return [true]
    }, [tipType, amount, token?.decimals, balance, erc721TokenId, erc721Address, t])

    return result
}
