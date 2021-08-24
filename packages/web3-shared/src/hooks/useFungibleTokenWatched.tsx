import { useState } from 'react'
import { EthereumTokenType } from '../types'
import { useTokenBalance } from './useTokenBalance'
import { useFungibleTokenDetailed } from './useFungibleTokenDetailed'
import { useNativeTokenDetailed } from './useNativeTokenDetailed'

export function useFungibleTokenWatched(initialToken?: {
    type: EthereumTokenType.ERC20 | EthereumTokenType.Native
    address: string
}) {
    const nativeToken = useNativeTokenDetailed()
    const [token = nativeToken.value, setToken] = useState(initialToken)

    const [amount, setAmount] = useState('')
    const balance = useTokenBalance(token?.type ?? EthereumTokenType.Native, token?.address ?? '')
    const detailed = useFungibleTokenDetailed(token?.type ?? EthereumTokenType.Native, token?.address ?? '')
    return {
        amount,
        token: detailed,
        balance,
        setAmount,
        setToken,
    }
}

export type FungibleTokenWatched = ReturnType<typeof useFungibleTokenWatched>
