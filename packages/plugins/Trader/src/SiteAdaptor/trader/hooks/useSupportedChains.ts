import { OKX } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

export const getSupportedChainsOptions = {
    queryKey: ['okx-swap', 'supported-chains'],
    queryFn: async () => {
        const chains = await OKX.getSupportedChains()
        // use ethereum chains only
        return chains?.filter((x) => x.dexTokenApproveAddress)
    },
} as const
export function useSupportedChains() {
    return useQuery(getSupportedChainsOptions)
}
