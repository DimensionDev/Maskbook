import type { Plugin } from '@masknet/plugin-infra'
import { ProviderIconClickBait } from '../components/ProviderIconClickBait'

export const Web3UI: Plugin.Shared.Web3UI = {
    SelectProviderDialog: {
        ProviderIconClickBait,
    },
}
