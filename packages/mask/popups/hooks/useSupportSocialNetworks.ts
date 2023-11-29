import Service from '#services'
import type { EnhanceableSite } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'

export function useSupportSocialNetworks() {
    return useQuery({
        queryKey: ['@@Service.SiteAdaptor.getSupportedSites({ isSocialNetwork: true })'],
        queryFn: async () => {
            const sites = await Service.SiteAdaptor.getSupportedSites({ isSocialNetwork: true })
            return sites.map((x) => x.networkIdentifier as EnhanceableSite)
        },
        networkMode: 'always',
    })
}
