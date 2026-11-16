import Service from '#services'
import { EMPTY_LIST, type EnhanceableSite } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'

export function useSupportSocialNetworks() {
    const { data } = useQuery({
        queryKey: ['@@Service.SiteAdaptor.getSupportedSites({ isSocialNetwork: true })'],
        queryFn: async () => {
            const sites = await Service.SiteAdaptor.getSupportedSites({ isSocialNetwork: true })
            return sites.map((x) => x.networkIdentifier as EnhanceableSite)
        },
        networkMode: 'always',
        // The persisted react-query cache may hold a corrupted non-array value (mf-6846).
        // Guard it so a bad cache crashes nothing and refetch on mount heals the cache.
        refetchOnMount: true,
    })
    return { data: Array.isArray(data) ? data : EMPTY_LIST }
}
