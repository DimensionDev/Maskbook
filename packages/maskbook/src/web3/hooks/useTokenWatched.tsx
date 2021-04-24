import { useState } from 'react'
import { ERC1155TokenDetailed, ERC721TokenDetailed, EthereumTokenType } from '../types'
import { useTokenBalance } from './useTokenBalance'
import { useTokenDetailed } from './useTokenDetailed'
import { useTokenAssetDetailed } from './useTokenAssetDetailed'
import { useNativeTokenDetailed } from './useNativeTokenDetailed'

export function useTokenWatched(initialToken?: { type: EthereumTokenType; address: string }) {
    const nativeToken = useNativeTokenDetailed()
    const [token = nativeToken.value, setToken] = useState(initialToken)

    const [amount, setAmount] = useState('')
    const balance = useTokenBalance(token?.type ?? EthereumTokenType.Native, token?.address ?? '')
    const detailed = useTokenDetailed(token?.type ?? EthereumTokenType.Native, token?.address ?? '')
    const assetDetailed = useTokenAssetDetailed(
        detailed.value?.type === EthereumTokenType.ERC721 || detailed.value?.type === EthereumTokenType.ERC1155
            ? (detailed.value as ERC721TokenDetailed | ERC1155TokenDetailed)
            : undefined,
    )
    return {
        amount,
        token: detailed,
        balance,
        assetDetailed,

        setAmount,
        setToken,
    }
}

export type TokenWatched = ReturnType<typeof useTokenWatched>
