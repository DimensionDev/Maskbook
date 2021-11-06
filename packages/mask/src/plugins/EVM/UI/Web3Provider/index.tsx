import type { Plugin } from '@masknet/plugin-infra'
import { useNetwork, useProvider } from '../../hooks'
import { ProviderIconClickBait } from '../components/ProviderIconClickBait'

export const Web3Provider: Plugin.Shared.Web3Provider = {
    SelectProviderDialog: {
        useNetwork,
        useProvider,
        ProviderIconClickBait,
    },
}
