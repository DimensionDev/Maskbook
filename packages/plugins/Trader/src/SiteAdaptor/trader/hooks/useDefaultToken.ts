import { useOKXTokenList } from '@masknet/web3-hooks-evm'
import type { ChainId } from '@masknet/web3-shared-evm'
import { sortBy } from 'lodash-es'
import { useMemo } from 'react'

const PREFER_TOKENS = ['usdt', 'usdc', 'dai', 'm.usdt', 'm.usdc']
/**
 * default token to trade
 */
export function useDefaultToken(chainId: ChainId, exclude?: string) {
    const { data: tokens } = useOKXTokenList(chainId)
    const excludeAddr = exclude?.toLowerCase()
    return useMemo(() => {
        if (!tokens) return
        const preferSet = new Set(PREFER_TOKENS)
        const matches = sortBy(
            tokens.filter((x) => {
                const symbol = x.symbol.toLowerCase()
                return preferSet.has(symbol) && x.address.toLowerCase() !== excludeAddr
            }),
            (x) => PREFER_TOKENS.indexOf(x.symbol.toLowerCase()),
        )

        return matches[0]
    }, [tokens, excludeAddr])
}
