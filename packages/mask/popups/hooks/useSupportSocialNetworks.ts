import { useAsync } from 'react-use'
import Service from '#services'
import type { EnhanceableSite } from '@masknet/shared-base'

export function useSupportSocialNetworks() {
    return useAsync(async () => {
        const sites = await Service.SiteAdaptor.getSupportedSites({ isSocialNetwork: true })
        return sites.map((x) => x.networkIdentifier as EnhanceableSite)
    }, [])
}
