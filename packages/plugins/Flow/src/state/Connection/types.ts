import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'

export interface FlowWeb3State extends Web3Helper.Web3State<NetworkPluginID.PLUGIN_FLOW> {}

export interface FlowConnection extends Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_FLOW> {}

export interface FlowConnectionOptions extends Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_FLOW> {}
