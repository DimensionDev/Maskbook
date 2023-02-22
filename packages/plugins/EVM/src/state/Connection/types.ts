import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { WalletProvider } from '@masknet/web3-shared-base'
import type { Web3, ChainId, ProviderType, Web3Provider } from '@masknet/web3-shared-evm'

export interface EVM_Web3State extends Web3Helper.Web3State<NetworkPluginID.PLUGIN_EVM> {}

export interface EVM_Provider extends WalletProvider<ChainId, ProviderType, Web3Provider, Web3> {}

export interface EVM_Connection extends Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_EVM> {}

export interface EVM_ConnectionOptions extends Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_EVM> {}
