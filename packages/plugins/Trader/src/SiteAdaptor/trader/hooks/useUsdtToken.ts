import { useOKXTokenList } from '@masknet/web3-hooks-evm'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useMemo } from 'react'

export function useUsdtToken(chainId: ChainId) {
    const { data: tokens } = useOKXTokenList(chainId)
    return useMemo(() => {
        const matches = tokens
            ?.filter((x) => x.symbol.toLowerCase().includes('usdt'))
            .sort((x) => (x.symbol.toLowerCase() === 'usdt' ? -1 : 0))

        return matches?.[0]
    }, [tokens])
}
