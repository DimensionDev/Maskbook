import type { Plugin } from '@masknet/plugin-infra'
import { useNetworkType, useProviderType } from '@masknet/web3-shared-evm'
import { PLUGIN_NETWORKS, PLUGIN_PROVIDERS } from '../../constants'
import { ProviderIconClickBait } from '../components/ProviderIconClickBait'

export const Web3Provider: Plugin.Shared.Web3Provider = {
    SelectProviderDialog: {
        useNetwork() {
            const networkType = useNetworkType()
            return PLUGIN_NETWORKS.find((x) => x.type === networkType) ?? null
        },
        useProvider() {
            const providerType = useProviderType()
            return PLUGIN_PROVIDERS.find((x) => x.type === providerType) ?? null
        },
        ProviderIconClickBait,
    },
}
