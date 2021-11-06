import type { Plugin } from '@masknet/plugin-infra'
import { useNetwork, useProvider } from '../../hooks'
import { ProviderIconClickBait } from '../components/ProviderIconClickBait'

export const Web3UIProvider: Plugin.Shared.Web3UIProvider = {
    Shared: {
        useNetwork,
        useProvider,
    },
    SelectProviderDialog: {
        ProviderIconClickBait,
    },
}
