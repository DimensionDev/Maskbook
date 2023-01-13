import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { ECKeyIdentifier, NetworkPluginID, Proof } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { RecognizableError, WalletProvider } from '@masknet/web3-shared-base'
import type {
    Web3,
    ChainId,
    ProviderType,
    EthereumMethodType,
    Transaction,
    Web3Provider,
    UserOperation,
} from '@masknet/web3-shared-evm'

export interface EVM_Web3State extends Web3Helper.Web3State<NetworkPluginID.PLUGIN_EVM> {}

export interface EVM_Web3ConnectionOptions extends Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_EVM> {}

export interface EVM_Provider extends WalletProvider<ChainId, ProviderType, Web3Provider, Web3> {}

export interface EVM_Connection extends Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_EVM> {}

export interface ERC721Metadata {
    name: string
    description: string
    image: string
}

export interface ERC1155Metadata {
    name: string
    decimals: number
    description: string
    image: string
}
