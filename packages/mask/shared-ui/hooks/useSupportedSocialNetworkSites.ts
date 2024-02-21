import Services from '#services'
import { useSuspenseQuery } from '@tanstack/react-query'

export function useSupportedSocialNetworkSites() {
    return useSuspenseQuery({
        queryKey: ['shared-ui', 'useSupportedSocialNetworkSites'],
        networkMode: 'always',
        queryFn: () => Services.SiteAdaptor.getSupportedSites({ isSocialNetwork: true }),
    }).data
}

export interface SiteAdaptor {
    networkIdentifier: string
}
