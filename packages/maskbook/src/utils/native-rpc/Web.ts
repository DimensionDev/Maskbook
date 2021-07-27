import type { WebviewAPIs } from './types'
import Services from '../../extension/service'
import { definedSocialNetworkWorkers } from '../../social-network/define'
import { launchPageSettings } from '../../settings/settings'
import stringify from 'json-stable-stringify'
import { unreachable } from '@dimensiondev/kit'

export const WebviewAPI: WebviewAPIs = {
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
    app_isPluginEnabled: async (id: string) => {
        return await Services.Settings.isPluginEnabled(id)
    },
    app_setPluginStatus: async (id: string, enabled: boolean) => {
        await Services.Settings.setPluginStatus(id, enabled)
    },
    setting_getNetworkTraderProvider: async (network) => {
        switch (network) {
            case 'eth':
                return await Services.Settings.getEthNetworkTradeProvider()
            case 'bsc':
                return await Services.Settings.getBscNetworkTradeProvider()
            case 'polygon':
                return await Services.Settings.getPolygonNetworkTradeProvider()
        }
    },
    setting_setNetworkTraderProvider: async (network, provider) => {
        switch (network) {
            case 'eth':
                await Services.Settings.setEthNetworkTradeProvider(provider)
                break
            case 'bsc':
                await Services.Settings.setBscNetworkTradeProvider(provider)
                break
            case 'polygon':
                await Services.Settings.setPolygonNetworkTradeProvider(provider)
                break
        }
    },
    settings_getTrendingDataSource: async () => {
        return await Services.Settings.getTrendingDataSource()
    },
    settings_setTrendingDataSource: async (provider) => {
        await Services.Settings.setTrendingDataSource(provider)
    },
}
