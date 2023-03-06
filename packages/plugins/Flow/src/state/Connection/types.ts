import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID, WalletProvider } from '@masknet/web3-shared-base'
import type { ChainId, ProviderType, Web3, Web3Provider } from '@masknet/web3-shared-flow'

export interface FlowProvider extends WalletProvider<ChainId, ProviderType, Web3Provider, Web3> {}

export interface FlowWeb3State extends Web3Helper.Web3State<NetworkPluginID.PLUGIN_FLOW> {}

export interface FlowConnection extends Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_FLOW> {}

export interface FlowConnectionOptions extends Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_FLOW> {}
