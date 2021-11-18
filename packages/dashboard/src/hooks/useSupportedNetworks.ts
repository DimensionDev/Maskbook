import { NetworkPluginID, useActivatedPluginsDashboard } from '@masknet/plugin-infra'

export const useSupportedNetworks = () => {
    const plugins = useActivatedPluginsDashboard()

    return (
        plugins
            .filter((x) => Object.values(NetworkPluginID).includes(x.ID as NetworkPluginID))
            // TODO: support flow chain
            .filter((x) => x.ID !== 'com.maskbook.flow')
            .map((x) => x.declareWeb3Networks ?? [])
            .flat()
    )
}
