import type { Plugin } from '@masknet/plugin-infra'
import { useNetworkType, useProviderType } from '@masknet/web3-shared-flow'
import { PLUGIN_NETWORKS, PLUGIN_PROVIDERS } from '../../constants'
import { ProviderIconClickBait } from '../components/ProviderIconClickBait'

export const Web3UI: Plugin.Shared.Web3UI = {
    Shared: {
        useNetwork() {
            const networkType = useNetworkType()
            return PLUGIN_NETWORKS.find((x) => x.type === networkType) ?? null
        },
        useProvider() {
            const providerType = useProviderType()
            return PLUGIN_PROVIDERS.find((x) => x.type === providerType) ?? null
        },
    },
    SelectProviderDialog: {
        ProviderIconClickBait,
    },
}
