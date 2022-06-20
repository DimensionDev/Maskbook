import type {
    Connection,
    ConnectionOptions,
    Hub,
    HubOptions,
    NetworkDescriptor,
    NetworkPluginID,
    ConnectionState,
    ProviderDescriptor,
    ProviderState,
    FungibleToken,
    NonFungibleToken,
    FungibleAsset,
    NonFungibleAsset,
    RecentTransaction,
    HubIndicator,
} from '@masknet/web3-shared-base'
import type * as EVM from '@masknet/web3-shared-evm'
import type * as Flow from '@masknet/web3-shared-flow'
import type * as Solana from '@masknet/web3-shared-solana'
import type { Web3Plugin } from '../web3-types'

export declare namespace Web3Helper {
    export type Definition = {
        [NetworkPluginID.PLUGIN_EVM]: {
            ChainId: EVM.ChainId
            SchemaType: EVM.SchemaType
            ProviderType: EVM.ProviderType
            NetworkType: EVM.NetworkType
            Signature: EVM.Signature
            GasOption: EVM.GasOption
            Block: EVM.Block
            Transaction: EVM.Transaction
            TransactionReceipt: EVM.TransactionReceipt
            TransactionDetailed: EVM.TransactionDetailed
            TransactionSignature: EVM.TransactionSignature
            TransactionParameter: EVM.TransactionParameter
            Web3Provider: EVM.Web3Provider
            Web3: EVM.Web3
        }
        [NetworkPluginID.PLUGIN_FLOW]: {
            ChainId: Flow.ChainId
            SchemaType: Flow.SchemaType
            ProviderType: Flow.ProviderType
            NetworkType: Flow.NetworkType
            Signature: Flow.Signature
            GasOption: Flow.GasOption
            Block: Flow.Block
            Transaction: Flow.Transaction
            TransactionReceipt: Flow.TransactionReceipt
            TransactionDetailed: Flow.TransactionDetailed
            TransactionSignature: Flow.TransactionSignature
            TransactionParameter: Flow.TransactionParameter
            Web3Provider: Flow.Web3Provider
            Web3: Flow.Web3
        }
        [NetworkPluginID.PLUGIN_SOLANA]: {
            ChainId: Solana.ChainId
            SchemaType: Solana.SchemaType
            ProviderType: Solana.ProviderType
            NetworkType: Solana.NetworkType
            Signature: Solana.Signature
            GasOption: Solana.GasOption
            Block: Solana.Block
            Transaction: Solana.Transaction
            TransactionReceipt: Solana.TransactionReceipt
            TransactionDetailed: Solana.TransactionDetailed
            TransactionSignature: Solana.TransactionSignature
            TransactionParameter: Solana.TransactionParameter
            Web3Provider: Solana.Web3Provider
            Web3: Solana.Web3
        }
    }

    export type Web3ProviderDescriptor<T extends NetworkPluginID = never> = T extends never
        ? never
        : ProviderDescriptor<Definition[T]['ChainId'], Definition[T]['ProviderType']>

    export type Web3NetworkDescriptor<T extends NetworkPluginID = never> = T extends never
        ? never
        : NetworkDescriptor<Definition[T]['ChainId'], Definition[T]['NetworkType']>

    export type Web3<T extends NetworkPluginID = never> = T extends never ? never : Definition[T]['Web3']

    export type Web3Provider<T extends NetworkPluginID = never> = T extends never
        ? never
        : Definition[T]['Web3Provider']

    export type Web3ProviderState<T extends NetworkPluginID = never> = T extends never
        ? never
        : ProviderState<Definition[T]['ChainId'], Definition[T]['ProviderType'], Definition[T]['NetworkType']>

    export type Web3ConnectionState<T extends NetworkPluginID = never> = T extends never
        ? never
        : ConnectionState<
              Definition[T]['ChainId'],
              Definition[T]['SchemaType'],
              Definition[T]['ProviderType'],
              Definition[T]['Signature'],
              Definition[T]['Block'],
              Definition[T]['Transaction'],
              Definition[T]['TransactionReceipt'],
              Definition[T]['TransactionDetailed'],
              Definition[T]['TransactionSignature'],
              Definition[T]['Web3'],
              Definition[T]['Web3Provider']
          >

    export type Web3ConnectionOptions<T extends NetworkPluginID = never> = T extends never
        ? never
        : ConnectionOptions<Definition[T]['ChainId'], Definition[T]['ProviderType'], Definition[T]['Transaction']>

    export type Web3Connection<T extends NetworkPluginID = never> = T extends never
        ? never
        : Connection<
              Definition[T]['ChainId'],
              Definition[T]['SchemaType'],
              Definition[T]['ProviderType'],
              Definition[T]['Signature'],
              Definition[T]['Block'],
              Definition[T]['Transaction'],
              Definition[T]['TransactionReceipt'],
              Definition[T]['TransactionDetailed'],
              Definition[T]['TransactionSignature'],
              Definition[T]['Web3'],
              Definition[T]['Web3Provider']
          >
    export type Web3HubOptions<T extends NetworkPluginID = never, Indicator = HubIndicator> = T extends never
        ? never
        : HubOptions<Definition[T]['ChainId'], Indicator>

    export type Web3Hub<T extends NetworkPluginID = never> = T extends never
        ? never
        : Hub<Definition[T]['ChainId'], Definition[T]['SchemaType'], Definition[T]['GasOption']>

    export type Web3State<T extends NetworkPluginID = never> = T extends never
        ? never
        : Web3Plugin.ObjectCapabilities.Capabilities<
              Definition[T]['ChainId'],
              Definition[T]['SchemaType'],
              Definition[T]['ProviderType'],
              Definition[T]['NetworkType'],
              Definition[T]['Signature'],
              Definition[T]['GasOption'],
              Definition[T]['Block'],
              Definition[T]['Transaction'],
              Definition[T]['TransactionReceipt'],
              Definition[T]['TransactionDetailed'],
              Definition[T]['TransactionSignature'],
              Definition[T]['TransactionParameter'],
              Definition[T]['Web3'],
              Definition[T]['Web3Provider']
          >

    export type Web3UI<T extends NetworkPluginID = never> = T extends never
        ? never
        : Web3Plugin.UI.UI<Definition[T]['ChainId'], Definition[T]['ProviderType'], Definition[T]['NetworkType']>

    export type ChainIdAll = Definition[NetworkPluginID]['ChainId']
    export type SchemaTypeAll = Definition[NetworkPluginID]['SchemaType']
    export type ProviderTypeAll = Definition[NetworkPluginID]['ProviderType']
    export type NetworkTypeAll = Definition[NetworkPluginID]['NetworkType']
    export type SignatureAll = Definition[NetworkPluginID]['Signature']
    export type GasOptionAll = Definition[NetworkPluginID]['GasOption']
    export type BlockAll = Definition[NetworkPluginID]['Block']
    export type TransactionAll = Definition[NetworkPluginID]['Transaction']
    export type TransactionReceiptAll = Definition[NetworkPluginID]['TransactionReceipt']
    export type TransactionDetailedAll = Definition[NetworkPluginID]['TransactionDetailed']
    export type TransactionSignatureAll = Definition[NetworkPluginID]['TransactionSignature']
    export type TransactionParameterAll = Definition[NetworkPluginID]['TransactionParameter']
    export type Web3All = Definition[NetworkPluginID]['Web3']
    export type Web3ProviderAll = Definition[NetworkPluginID]['Web3Provider']

    export type NetworkDescriptorAll = NetworkDescriptor<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['NetworkType']
    >

    export type ProviderDescriptorAll = ProviderDescriptor<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['ProviderType']
    >

    export type Web3ConnectionOptionsAll = ConnectionOptions<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['ProviderType'],
        Definition[NetworkPluginID]['Transaction']
    >

    export type Web3ConnectionAll = Connection<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['SchemaType'],
        Definition[NetworkPluginID]['ProviderType'],
        Definition[NetworkPluginID]['Signature'],
        Definition[NetworkPluginID]['Block'],
        Definition[NetworkPluginID]['Transaction'],
        Definition[NetworkPluginID]['TransactionReceipt'],
        Definition[NetworkPluginID]['TransactionDetailed'],
        Definition[NetworkPluginID]['TransactionSignature'],
        Definition[NetworkPluginID]['Web3'],
        Definition[NetworkPluginID]['Web3Provider']
    >

    export type Web3HubOptionsAll = HubOptions<Definition[NetworkPluginID]['ChainId']>

    export type Web3HubAll = Hub<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['SchemaType'],
        Definition[NetworkPluginID]['GasOption']
    >

    export type Web3StateAll = Web3Plugin.ObjectCapabilities.Capabilities<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['SchemaType'],
        Definition[NetworkPluginID]['ProviderType'],
        Definition[NetworkPluginID]['NetworkType'],
        Definition[NetworkPluginID]['Signature'],
        Definition[NetworkPluginID]['GasOption'],
        Definition[NetworkPluginID]['Block'],
        Definition[NetworkPluginID]['Transaction'],
        Definition[NetworkPluginID]['TransactionReceipt'],
        Definition[NetworkPluginID]['TransactionDetailed'],
        Definition[NetworkPluginID]['TransactionSignature'],
        Definition[NetworkPluginID]['TransactionParameter'],
        Definition[NetworkPluginID]['Web3'],
        Definition[NetworkPluginID]['Web3Provider']
    >

    export type Web3UIAll = Web3Plugin.UI.UI<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['ProviderType'],
        Definition[NetworkPluginID]['NetworkType']
    >

    export type Scope<S extends 'all' | void = void, T = unknown, F = unknown> = S extends 'all' ? T : F

    export type ChainIdScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all' ? Web3Helper.ChainIdAll : Web3Helper.Definition[T]['ChainId']
    export type NetworkTypeScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all' ? Web3Helper.NetworkTypeAll : Web3Helper.Definition[T]['NetworkType']
    export type ProviderTypeScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all' ? Web3Helper.ProviderTypeAll : Web3Helper.Definition[T]['ProviderType']
    export type SchemaTypeScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all' ? Web3Helper.SchemaTypeAll : Web3Helper.Definition[T]['SchemaType']
    export type TransactionScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all' ? TransactionAll : Web3Helper.Definition[T]['Transaction']
    export type RecentTransactionScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = RecentTransaction<ChainIdScope<S, T>, TransactionScope<S, T>>
    export type FungibleTokenScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = FungibleToken<ChainIdScope<S, T>, SchemaTypeScope<S, T>>
    export type NonFungibleTokenScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = NonFungibleToken<ChainIdScope<S, T>, SchemaTypeScope<S, T>>
    export type FungibleAssetScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = FungibleAsset<ChainIdScope<S, T>, SchemaTypeScope<S, T>>
    export type NonFungibleAssetScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = NonFungibleAsset<ChainIdScope<S, T>, SchemaTypeScope<S, T>>
    export type NetworkDescriptorScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all'
        ? NetworkDescriptorAll
        : NetworkDescriptor<Definition[T]['ChainId'], Definition[T]['NetworkType']>
    export type ProviderDescriptorScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all'
        ? ProviderDescriptorAll
        : ProviderDescriptor<Definition[T]['ChainId'], Definition[T]['ProviderType']>
    export type Web3Scope<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID> = S extends 'all'
        ? Web3All
        : Definition[T]['Web3']
    export type Web3ProviderScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all' ? Web3ProviderAll : Definition[T]['Web3Provider']
    export type Web3StateScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all'
        ? Web3StateAll
        : Web3Plugin.ObjectCapabilities.Capabilities<
              Definition[T]['ChainId'],
              Definition[T]['SchemaType'],
              Definition[T]['ProviderType'],
              Definition[T]['NetworkType'],
              Definition[T]['Signature'],
              Definition[T]['GasOption'],
              Definition[T]['Block'],
              Definition[T]['Transaction'],
              Definition[T]['TransactionReceipt'],
              Definition[T]['TransactionDetailed'],
              Definition[T]['TransactionSignature'],
              Definition[T]['TransactionParameter'],
              Definition[T]['Web3'],
              Definition[T]['Web3Provider']
          >
    export type Web3ConnectionOptionsScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all'
        ? Web3ConnectionOptionsAll
        : ConnectionOptions<Definition[T]['ChainId'], Definition[T]['ProviderType'], Definition[T]['Transaction']>
    export type Web3ConnectionScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all'
        ? Web3ConnectionAll
        : Connection<
              Definition[T]['ChainId'],
              Definition[T]['SchemaType'],
              Definition[T]['ProviderType'],
              Definition[T]['Signature'],
              Definition[T]['Block'],
              Definition[T]['Transaction'],
              Definition[T]['TransactionReceipt'],
              Definition[T]['TransactionDetailed'],
              Definition[T]['TransactionSignature'],
              Definition[T]['Web3'],
              Definition[T]['Web3Provider']
          >
    export type Web3UIScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all'
        ? Web3UIAll
        : Web3Plugin.UI.UI<Definition[T]['ChainId'], Definition[T]['ProviderType'], Definition[T]['NetworkType']>
    export type Web3HubOptionsScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
        Indicator = HubIndicator,
    > = S extends 'all' ? Web3HubOptionsAll : HubOptions<Definition[T]['ChainId'], Indicator>
    export type Web3HubScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all'
        ? Web3HubAll
        : Hub<Definition[T]['ChainId'], Definition[T]['SchemaType'], Definition[T]['GasOption']>
}
