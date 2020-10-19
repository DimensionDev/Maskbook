import { useCallback, useState } from 'react'
import { EthereumAddress } from 'wallet.ts'
import { createEetherToken } from '../helpers'
import { useChainId } from './useChainState'
import { useTokensDetailedDebank } from './useTokensDetailedDebank'
import { useTokensDetailed } from './useTokensDetailed'
import { useTokensDetailedMerged } from './useTokensDetailedMerged'
import type { Token } from '../types'

export function useTokensDetailedCallback(tokens: Token[]) {
    const chainId = useChainId()
    const [address, setAddress] = useState('')
    const chainDetailedTokens = useTokensDetailed(address, [createEetherToken(chainId), ...tokens])
    const debankDetailedTokens = useTokensDetailedDebank(address)

    // should place debank detailed tokens at the first place
    // it prevents them from replacing by previous detailed tokens because the uniq algorithm
    const detailedTokens = useTokensDetailedMerged(debankDetailedTokens, chainDetailedTokens)

    const detailedTokensCallback = useCallback((address: string) => {
        if (!EthereumAddress.isValid(address)) return
        setAddress(address)
    }, [])

    return [detailedTokens, detailedTokensCallback] as const
}
