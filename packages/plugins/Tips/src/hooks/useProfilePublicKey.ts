import { resolveNetworkToNextIDPlatform } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'
import { NextIDProof } from '@masknet/web3-providers'
import { useBaseUIRuntime } from '@masknet/shared'

export function useProfilePublicKey(userId?: string) {
    const { networkIdentifier } = useBaseUIRuntime()
    const platform = resolveNetworkToNextIDPlatform(networkIdentifier)
    return useQuery({
        enabled: Boolean(userId && platform),
        queryKey: ['next-id', 'lasted-active', platform, userId],
        queryFn: async () => {
            const binding = await NextIDProof.queryLatestBindingByPlatform(platform!, userId!)
            return binding?.persona ?? null
        },
    })
}
