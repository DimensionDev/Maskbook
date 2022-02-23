import { useState } from 'react'
import { Web3TokenType } from '@masknet/web3-shared-base'
import { useFungibleTokenBalance } from './useFungibleTokenBalance'
import { useFungibleTokenDetailed } from './useFungibleTokenDetailed'
import { useNativeTokenDetailed } from './useNativeTokenDetailed'

export function useFungibleTokenWatched(initialToken?: {
    type: Web3TokenType.ERC20 | Web3TokenType.Native
    address: string
}) {
    const nativeToken = useNativeTokenDetailed()
    const [token = nativeToken.value, setToken] = useState(initialToken)

    const [amount, setAmount] = useState('')
    const balance = useFungibleTokenBalance(token?.type ?? Web3TokenType.Native, token?.address ?? '')
    const detailed = useFungibleTokenDetailed(token?.type ?? Web3TokenType.Native, token?.address ?? '')

    return {
        amount,
        token: detailed,
        balance,
        setAmount,
        setToken,
    }
}

export type FungibleTokenWatched = ReturnType<typeof useFungibleTokenWatched>
