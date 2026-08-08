import { OKX } from '@masknet/web3-providers'
import type { ChainDex } from '@masknet/web3-providers/types'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'

/** @internal */
export const getSupportedChainsOptions = {
    enabled: false, // TODO: Temporarily disabled due to OKX server downtime.
    queryKey: ['okx-swap', 'supported-chains'],
    queryFn: async () => {
        const chains = await OKX.getSupportedChains()
        // use ethereum chains only
        return chains?.filter((x) => x.dexTokenApproveAddress)
    },
} as const

export function useSupportedChains(): UseQueryResult<ChainDex[]> {
    return useQuery(getSupportedChainsOptions)
}
