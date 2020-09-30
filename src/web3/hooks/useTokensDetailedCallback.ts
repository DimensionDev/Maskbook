import { useCallback, useState } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { createEetherToken } from '../helpers'
import { useChainId } from './useChainId'
import { useTokensDetailedDebank } from './useTokensDetailedDebank'
import { useTokensDetailed } from './useTokensDetailed'
import { useTokensDetailedMerged } from './useTokensDetailedMerged'
import type { Token } from '../types'

export function useTokensDetailedCallback(tokens: Token[]) {
    const chainId = useChainId()
    const [address, setAddress] = useState('')
    const chainDetailedTokens = useTokensDetailed(address, [createEetherToken(chainId), ...tokens])
    const debankDetailedTokens = useTokensDetailedDebank(address)
    const detailedTokens = useTokensDetailedMerged(chainDetailedTokens, debankDetailedTokens)

    const fetchDetailedTokens = useCallback((address: string) => {
        if (!EthereumAddress.isValid(address)) return
        setAddress(address)
    }, [])

    return [detailedTokens, fetchDetailedTokens] as const
}
