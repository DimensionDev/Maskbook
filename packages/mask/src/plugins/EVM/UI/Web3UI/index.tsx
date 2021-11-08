import type { Plugin } from '@masknet/plugin-infra'
import { useNetwork, useProvider } from '../../hooks'
import { ProviderIconClickBait } from '../components/ProviderIconClickBait'

export const Web3UI: Plugin.Shared.Web3UI = {
    Shared: {
        useNetwork,
        useProvider,
    },
    SelectProviderDialog: {
        ProviderIconClickBait,
    },
}
