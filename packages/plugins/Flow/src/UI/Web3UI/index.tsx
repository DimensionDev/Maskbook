import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { ProviderIconClickBait } from '../components/ProviderIconClickBait'

export const Web3UI: Web3Plugin.UI.UI = {
    SelectProviderDialog: {
        ProviderIconClickBait,
    },
    WalletStatusDialog: {},
}
