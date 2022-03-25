import { isGreaterThan, isLessThanOrEqualTo, rightShift, Web3TokenType } from '@masknet/web3-shared-base'
import { useFungibleTokenBalance } from '@masknet/web3-shared-evm'
import { useContext, useMemo } from 'react'
import { useI18N } from '../../locales'
import { TipType } from '../../types'
import { TipContext } from './TipContext'

type ValidationTuple = [isValid: boolean, message?: string]

export function useTipValidate(): ValidationTuple {
    const { tipType, amount, token, erc721TokenId, erc721Contract } = useContext(TipContext)
    const { value: balance = '0' } = useFungibleTokenBalance(token?.type || Web3TokenType.Native, token?.address)
    const t = useI18N()

    const result: ValidationTuple = useMemo(() => {
        if (tipType === TipType.Token) {
            if (!amount || isLessThanOrEqualTo(amount, 0)) return [false]
            if (isGreaterThan(rightShift(amount, token?.decimals), balance))
                return [false, t.token_insufficient_balance()]
        } else {
            if (!erc721TokenId || !erc721Contract) return [false]
        }
        return [true]
    }, [tipType, amount, token?.decimals, balance, erc721Contract, erc721TokenId, t])

    return result
}
