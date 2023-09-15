import Services from '#services'
import type { EnhanceableSite } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'

export const useSupportedSites = () => {
    return useQuery({
        queryKey: ['supported-sites'],
        queryFn: async () => {
            const sites = await Services.SiteAdaptor.getOriginsWithNoPermission()
            const settings = await Services.Settings.getAllInjectSwitchSettings()
            return Promise.all(
                sites.map(async (x) => ({
                    ...x,
                    allowInject: settings[x.networkIdentifier as EnhanceableSite],
                })),
            )
        },
    })
}
