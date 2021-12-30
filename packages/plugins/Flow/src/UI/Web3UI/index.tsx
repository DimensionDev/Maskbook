import type { Web3Plugin } from '@masknet/plugin-infra'
import { ProviderIconClickBait } from '../components/ProviderIconClickBait'

export const Web3UI: Web3Plugin.UI.UI = {
    SelectProviderDialog: {
        ProviderIconClickBait,
    },
    WalletStatusDialog: {},
}
