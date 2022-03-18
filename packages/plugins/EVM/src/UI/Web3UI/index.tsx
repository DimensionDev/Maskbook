import type { Web3Plugin } from '@masknet/plugin-infra'
import { NetworkIconClickBait } from '../components/NetworkIconClickBait'
import { ProviderIconClickBait } from '../components/ProviderIconClickBait'

export const Web3UI: Web3Plugin.UI.UI = {
    SelectNetworkMenu: {
        NetworkIconClickBait,
    },
    SelectProviderDialog: {
        ProviderIconClickBait,
    },
}
