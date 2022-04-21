import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-solana'
import { ProviderIconClickBait } from '../components/ProviderIconClickBait'

export const Web3UI: Web3Plugin.UI.UI<ChainId, ProviderType, NetworkType> = {
    SelectProviderDialog: {
        ProviderIconClickBait,
    },
}
