import type { NetworkPluginID, Web3Helper, Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId, FclProvider, Web3 } from '@masknet/web3-shared-flow'

export type FlowWeb3 = Web3

export type FlowWeb3State = Web3Helper.Web3State<NetworkPluginID.PLUGIN_FLOW>

export interface FlowProvider extends Web3Plugin.WalletProvider<ChainId, FclProvider, FlowWeb3> {}

export interface FlowConnection extends Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_FLOW> {}

export type FlowConnectionOptions = Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_FLOW>
