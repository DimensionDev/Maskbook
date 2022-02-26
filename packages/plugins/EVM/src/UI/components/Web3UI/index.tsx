import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import { NetworkIconClickBait } from '../NetworkIconClickBait'
import { ProviderIconClickBait } from '../ProviderIconClickBait'

export const Web3UI: Web3Plugin.UI.UI = {
    SelectNetworkMenu: {
        NetworkIconClickBait,
    },
    SelectProviderDialog: {
        ProviderIconClickBait,
    },
}
