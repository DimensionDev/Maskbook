import { OKX } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { skipToken, useQuery } from '@tanstack/react-query'

export function useLiquidityResources(chainId: ChainId) {
    return useQuery({
        queryKey: ['okx-swap', 'liquidity', chainId],
        queryFn: chainId ? async () => OKX.getLiquidity(chainId.toString()) : skipToken,
    })
}
