import { MaskNetworkAPIs, NetworkType } from '@masknet/public-api'
import Services from '../../extension/service'
import { definedSocialNetworkWorkers } from '../../social-network/define'
import { launchPageSettings } from '../../settings/settings'
import stringify from 'json-stable-stringify'
import { unreachable } from '@dimensiondev/kit'

export const MaskNetworkAPI: MaskNetworkAPIs = {
    web_echo: async (arg) => arg,
    getDashboardURL: async () => browser.runtime.getURL('/index.html'),
    getSettings: async (key) => {
        if (key === 'launchPageSettings') return launchPageSettings.value
        unreachable(key)
    },
    getConnectedPersonas: async () => {
        const personas = await Services.Identity.queryMyPersonas()
        const connectedPersonas: { network: string; connected: boolean }[][] = personas
            .filter((p) => !p.uninitialized)
            .map((p) => {
                const profiles = [...p.linkedProfiles]
                const providers = [...definedSocialNetworkWorkers].map((i) => {
                    const profile = profiles.find(([key]) => key.network === i.networkIdentifier)
                    return {
                        network: i.networkIdentifier,
                        connected: !!profile,
                    }
                })
                return providers
            })
        return stringify(connectedPersonas)
    },
    app_isPluginEnabled: (id) => Services.Settings.isPluginEnabled(id),
    app_setPluginStatus: (id, enabled) => Services.Settings.setPluginStatus(id, enabled),
    setting_getNetworkTraderProvider: (network) => {
        switch (network) {
            case NetworkType.Ethereum:
                return Services.Settings.getEthereumNetworkTradeProvider()
            case NetworkType.Binance:
                return Services.Settings.getBinanceNetworkTradeProvider()
            case NetworkType.Polygon:
                return Services.Settings.getPolygonNetworkTradeProvider()
            case NetworkType.Arbitrum:
                throw new Error('TODO')
            default:
                unreachable(network)
        }
    },
    setting_setNetworkTraderProvider: (network, provider) => {
        switch (network) {
            case NetworkType.Ethereum:
                return Services.Settings.setEthNetworkTradeProvider(provider)
            case NetworkType.Binance:
                return Services.Settings.setBinanceNetworkTradeProvider(provider)
            case NetworkType.Polygon:
                return Services.Settings.setPolygonNetworkTradeProvider(provider)
            case NetworkType.Arbitrum:
                throw new Error('TODO')
            default:
                unreachable(network)
        }
    },
    settings_getTrendingDataSource: () => Services.Settings.getTrendingDataSource(),
    settings_setTrendingDataSource: (provider) => Services.Settings.setTrendingDataSource(provider),
    settings_getLaunchPageSettings: async () => launchPageSettings.value,
}
