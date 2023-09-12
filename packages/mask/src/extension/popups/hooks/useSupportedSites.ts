import { type EnhanceableSite } from '@masknet/shared-base'
import Services from '#services'
import { useQuery } from '@tanstack/react-query'

export const useSupportedSites = () => {
    return useQuery({
        queryKey: ['supported-sites'],
        queryFn: async () => {
            const sites = await Services.SiteAdaptor.getOriginsWithPermission()
            const injectSwitchSettings = await Services.Settings.getInjectSwitchSettings()
            return sites.map((x) => ({
                ...x,
                allowInject: injectSwitchSettings[x.networkIdentifier as EnhanceableSite],
            }))
        },
    })
}
