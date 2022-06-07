import type { Web3Helper } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

export interface SolanaHub extends Web3Helper.Web3Hub<NetworkPluginID.PLUGIN_SOLANA> {}
