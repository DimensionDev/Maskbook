import { useAccount, useFungibleTokenBalance } from '@masknet/plugin-infra/web3'
import { isGreaterThan, isLessThanOrEqualTo, rightShift } from '@masknet/web3-shared-base'
import { useContext, useMemo } from 'react'
import { useI18N } from '../../locales'
import { TipType } from '../../types'
import { TargetRuntimeContext } from '../TargetRuntimeContext'
import { TipContext } from './TipContext'

type ValidationTuple = [isValid: boolean, message?: string]

export function useTipValidate(): ValidationTuple {
    const {
        tipType,
        amount,
        token,
        nonFungibleTokenId: tokenId,
        nonFungibleTokenAddress: tokenAddress,
    } = useContext(TipContext)
    const account = useAccount()
    const { pluginId, targetChainId: chainId } = TargetRuntimeContext.useContainer()
    const { value: balance = '0' } = useFungibleTokenBalance(pluginId, token?.address, { chainId, account })
    const t = useI18N()

    const result: ValidationTuple = useMemo(() => {
        if (tipType === TipType.Token) {
            if (!amount || isLessThanOrEqualTo(amount, 0)) return [false]
            if (isGreaterThan(rightShift(amount, token?.decimals), balance))
                return [false, t.token_insufficient_balance()]
        } else {
            if (!tokenId || !tokenAddress) return [false]
        }
        return [true]
    }, [tipType, amount, token?.decimals, balance, tokenId, tokenAddress, t])

    return result
}
