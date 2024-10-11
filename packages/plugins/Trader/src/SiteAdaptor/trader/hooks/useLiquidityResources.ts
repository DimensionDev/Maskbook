import { OKX } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { skipToken, useQuery } from '@tanstack/react-query'
import { REFETCH_INTERVAL } from '../../constants.js'

export function useLiquidityResources(chainId: ChainId, enabled = true) {
    return useQuery({
        enabled,
        queryKey: ['okx-swap', 'liquidity', chainId],
        queryFn:
            chainId ?
                async () => {
                    const res = await OKX.getLiquidity(chainId.toString())
                    return res?.code === 0 ? res.data : undefined
                }
            :   skipToken,
        refetchInterval: REFETCH_INTERVAL,
    })
}
