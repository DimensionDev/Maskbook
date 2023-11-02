import Services from '#services'
import type { EnhanceableSite } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'

export function useSupportedSites() {
    return useQuery({
        queryKey: ['supported-sites'],
        networkMode: 'always',
        queryFn: async () => {
            const sites = await Services.SiteAdaptor.getAllOrigins()
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
