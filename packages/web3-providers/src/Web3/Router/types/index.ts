import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { BaseUtils } from '../../Base/apis/OthersAPI.js'
import type { BaseConnection } from '../../Base/apis/ConnectionAPI.js'
import type { BaseHubProvider } from '../../Base/apis/HubBaseAPI.js'
import type { BaseHubFungible } from '../../Base/apis/HubFungibleAPI.js'
import type { BaseHubNonFungible } from '../../Base/apis/HubNonFungibleAPI.js'
import type { EVMConnectionOptions, EVMHubOptions } from '../../EVM/types/index.js'
import type { FlowConnectionOptions, FlowHubOptions } from '../../Flow/types/index.js'
import type { SolanaConnectionOptions, SolanaHubOptions } from '../../Solana/types/index.js'
import type { BaseConnectionOptions } from '../../Base/apis/ConnectionOptionsAPI.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptionsAPI.js'

export interface ConnectionOptions<T extends NetworkPluginID>
    extends BaseConnectionOptions<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['ProviderType'],
        Web3Helper.Definition[T]['Transaction']
    > {}
export interface ConnectionOptionsMap {
    [NetworkPluginID.PLUGIN_EVM]: EVMConnectionOptions
    [NetworkPluginID.PLUGIN_FLOW]: FlowConnectionOptions
    [NetworkPluginID.PLUGIN_SOLANA]: SolanaConnectionOptions
}
export interface HubOptions<T extends NetworkPluginID> extends BaseHubOptions<Web3Helper.Definition[T]['ChainId']> {}
export interface HubOptionsMap {
    [NetworkPluginID.PLUGIN_EVM]: EVMHubOptions
    [NetworkPluginID.PLUGIN_FLOW]: FlowHubOptions
    [NetworkPluginID.PLUGIN_SOLANA]: SolanaHubOptions
}

export interface Connection<T extends NetworkPluginID>
    extends BaseConnection<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['AddressType'],
        Web3Helper.Definition[T]['SchemaType'],
        Web3Helper.Definition[T]['ProviderType'],
        Web3Helper.Definition[T]['Signature'],
        Web3Helper.Definition[T]['Operation'],
        Web3Helper.Definition[T]['Transaction'],
        Web3Helper.Definition[T]['TransactionReceipt'],
        Web3Helper.Definition[T]['TransactionDetailed'],
        Web3Helper.Definition[T]['TransactionSignature'],
        Web3Helper.Definition[T]['Block'],
        Web3Helper.Definition[T]['Web3'],
        Web3Helper.Definition[T]['Web3Provider']
    > {}

export interface Hub<T extends NetworkPluginID>
    extends BaseHubProvider<
            Web3Helper.Definition[T]['ChainId'],
            Web3Helper.Definition[T]['SchemaType'],
            Web3Helper.Definition[T]['GasOption']
        >,
        BaseHubFungible<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
        BaseHubNonFungible<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']> {}

export interface Utils<T extends NetworkPluginID>
    extends BaseUtils<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['SchemaType'],
        Web3Helper.Definition[T]['ProviderType'],
        Web3Helper.Definition[T]['NetworkType'],
        Web3Helper.Definition[T]['Transaction']
    > {}
