import { NetworkPluginID } from '@masknet/shared-base'
import type {
    Connection,
    ConnectionOptions,
    Hub,
    HubOptions,
    NetworkDescriptor,
    ConnectionState,
    ProviderDescriptor,
    ProviderState,
    FungibleToken,
    NonFungibleToken,
    FungibleAsset,
    NonFungibleAsset,
    RecentTransaction,
    HubIndicator,
    FungibleTokenSecurity,
    NonFungibleTokenActivity,
    NonFungibleTokenSecurity,
    Web3State as Web3StateShared,
    Web3UI as Web3UIShared,
    SearchResult,
    TokenResult,
    FungibleTokenResult,
    NonFungibleTokenResult,
} from '@masknet/web3-shared-base'
import type * as EVM from '@masknet/web3-shared-evm'
import type * as Flow from '@masknet/web3-shared-flow'
import type * as Solana from '@masknet/web3-shared-solana'

export declare namespace Web3Helper {
    export type Definition = {
        [NetworkPluginID.PLUGIN_EVM]: {
            ChainId: EVM.ChainId
            AddressType: EVM.AddressType
            SchemaType: EVM.SchemaType
            ChainContextGetter: EVM.ProviderType
            NetworkType: EVM.NetworkType
            ProviderType: EVM.ProviderType
            Signature: EVM.Signature
            GasOption: EVM.GasOption
            Block: EVM.Block
            Operation: EVM.UserOperation
            Transaction: EVM.Transaction
            TransactionReceipt: EVM.TransactionReceipt
            TransactionDetailed: EVM.TransactionDetailed
            TransactionSignature: EVM.TransactionSignature
            TransactionParameter: EVM.TransactionParameter
            UserOperation: EVM.UserOperation
            Web3Provider: EVM.Web3Provider
            Web3: EVM.Web3
        }
        [NetworkPluginID.PLUGIN_FLOW]: {
            ChainId: Flow.ChainId
            AddressType: Flow.AddressType
            SchemaType: Flow.SchemaType
            ChainContextGetter: Flow.ProviderType
            NetworkType: Flow.NetworkType
            ProviderType: Flow.ProviderType
            Signature: Flow.Signature
            GasOption: Flow.GasOption
            Block: Flow.Block
            Operation: Flow.Operation
            Transaction: Flow.Transaction
            TransactionReceipt: Flow.TransactionReceipt
            TransactionDetailed: Flow.TransactionDetailed
            TransactionSignature: Flow.TransactionSignature
            TransactionParameter: Flow.TransactionParameter
            UserOperation: Flow.Operation
            Web3Provider: Flow.Web3Provider
            Web3: Flow.Web3
        }
        [NetworkPluginID.PLUGIN_SOLANA]: {
            ChainId: Solana.ChainId
            AddressType: Solana.AddressType
            SchemaType: Solana.SchemaType
            ChainContextGetter: Solana.ProviderType
            NetworkType: Solana.NetworkType
            ProviderType: Solana.ProviderType
            Signature: Solana.Signature
            GasOption: Solana.GasOption
            Block: Solana.Block
            Operation: Solana.Operation
            Transaction: Solana.Transaction
            TransactionReceipt: Solana.TransactionReceipt
            TransactionDetailed: Solana.TransactionDetailed
            TransactionSignature: Solana.TransactionSignature
            TransactionParameter: Solana.TransactionParameter
            UserOperation: Solana.Operation
            Web3Provider: Solana.Web3Provider
            Web3: Solana.Web3
        }
    }

    export type Web3ProviderDescriptor<T extends NetworkPluginID = never> = T extends never
        ? never
        : ProviderDescriptor<Definition[T]['ChainId'], Definition[T]['ChainContextGetter']>

    export type Web3NetworkDescriptor<T extends NetworkPluginID = never> = T extends never
        ? never
        : NetworkDescriptor<Definition[T]['ChainId'], Definition[T]['NetworkType']>

    export type Web3<T extends NetworkPluginID = never> = T extends never ? never : Definition[T]['Web3']

    export type Web3Provider<T extends NetworkPluginID = never> = T extends never
        ? never
        : Definition[T]['Web3Provider']

    export type Web3ProviderState<T extends NetworkPluginID = never> = T extends never
        ? never
        : ProviderState<Definition[T]['ChainId'], Definition[T]['ChainContextGetter'], Definition[T]['NetworkType']>

    export type Web3ConnectionState<T extends NetworkPluginID = never> = T extends never
        ? never
        : ConnectionState<
              Definition[T]['ChainId'],
              Definition[T]['AddressType'],
              Definition[T]['SchemaType'],
              Definition[T]['ChainContextGetter'],
              Definition[T]['Signature'],
              Definition[T]['Block'],
              Definition[T]['Operation'],
              Definition[T]['Transaction'],
              Definition[T]['TransactionReceipt'],
              Definition[T]['TransactionDetailed'],
              Definition[T]['TransactionSignature'],
              Definition[T]['Web3'],
              Definition[T]['Web3Provider']
          >

    export type Web3ConnectionOptions<T extends NetworkPluginID = never> = T extends never
        ? never
        : ConnectionOptions<Definition[T]['ChainId'], Definition[T]['ChainContextGetter'], Definition[T]['Transaction']>

    export type Web3Connection<T extends NetworkPluginID = never> = T extends never
        ? never
        : Connection<
              Definition[T]['ChainId'],
              Definition[T]['AddressType'],
              Definition[T]['SchemaType'],
              Definition[T]['ChainContextGetter'],
              Definition[T]['Signature'],
              Definition[T]['Block'],
              Definition[T]['Operation'],
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
        : Web3StateShared<
              Definition[T]['ChainId'],
              Definition[T]['AddressType'],
              Definition[T]['SchemaType'],
              Definition[T]['ChainContextGetter'],
              Definition[T]['NetworkType'],
              Definition[T]['Signature'],
              Definition[T]['GasOption'],
              Definition[T]['Block'],
              Definition[T]['Operation'],
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
        : Web3UIShared<Definition[T]['ChainId'], Definition[T]['ChainContextGetter'], Definition[T]['NetworkType']>

    export type ChainIdAll = Definition[NetworkPluginID]['ChainId']
    export type AddressTypeAll = Definition[NetworkPluginID]['AddressType']
    export type SchemaTypeAll = Definition[NetworkPluginID]['SchemaType']
    export type ProviderTypeAll = Definition[NetworkPluginID]['ChainContextGetter']
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

    export type FungibleTokenAll = FungibleToken<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['SchemaType']
    >
    export type NonFungibleTokenAll = NonFungibleToken<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['SchemaType']
    >

    export type SearchResultAll = SearchResult<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['SchemaType']
    >

    export type FungibleTokenResultAll = FungibleTokenResult<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['SchemaType']
    >

    export type NonFungibleTokenResultAll = NonFungibleTokenResult<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['SchemaType']
    >

    export type NonFungibleTokenActivityAll = NonFungibleTokenActivity<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['SchemaType']
    >

    export type TokenResultAll = TokenResult<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['SchemaType']
    >

    export type NetworkDescriptorAll = NetworkDescriptor<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['NetworkType']
    >

    export type ProviderDescriptorAll = ProviderDescriptor<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['ChainContextGetter']
    >

    export type Web3ConnectionOptionsAll = ConnectionOptions<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['ChainContextGetter'],
        Definition[NetworkPluginID]['Transaction']
    >

    export type Web3ConnectionAll = Connection<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['AddressType'],
        Definition[NetworkPluginID]['SchemaType'],
        Definition[NetworkPluginID]['ChainContextGetter'],
        Definition[NetworkPluginID]['Signature'],
        Definition[NetworkPluginID]['Block'],
        Definition[NetworkPluginID]['Operation'],
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

    export type Web3StateAll = Web3StateShared<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['AddressType'],
        Definition[NetworkPluginID]['SchemaType'],
        Definition[NetworkPluginID]['ChainContextGetter'],
        Definition[NetworkPluginID]['NetworkType'],
        Definition[NetworkPluginID]['Signature'],
        Definition[NetworkPluginID]['GasOption'],
        Definition[NetworkPluginID]['Block'],
        Definition[NetworkPluginID]['Operation'],
        Definition[NetworkPluginID]['Transaction'],
        Definition[NetworkPluginID]['TransactionReceipt'],
        Definition[NetworkPluginID]['TransactionDetailed'],
        Definition[NetworkPluginID]['TransactionSignature'],
        Definition[NetworkPluginID]['TransactionParameter'],
        Definition[NetworkPluginID]['Web3'],
        Definition[NetworkPluginID]['Web3Provider']
    >

    export type Web3UIAll = Web3UIShared<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['ChainContextGetter'],
        Definition[NetworkPluginID]['NetworkType']
    >

    export type Scope<S extends 'all' | void = void, T = unknown, F = unknown> = S extends 'all' ? T : F

    export type ChainIdScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all' ? Web3Helper.ChainIdAll : Web3Helper.Definition[T]['ChainId']
    export type AddressTypeScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all' ? Web3Helper.AddressTypeAll : Web3Helper.Definition[T]['AddressType']
    export type NetworkTypeScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all' ? Web3Helper.NetworkTypeAll : Web3Helper.Definition[T]['NetworkType']
    export type ProviderTypeScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all' ? Web3Helper.ProviderTypeAll : Web3Helper.Definition[T]['ChainContextGetter']
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
    export type FungibleTokenSecurityScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = FungibleTokenSecurity
    export type NonFungibleTokenSecurityScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = NonFungibleTokenSecurity
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
        : ProviderDescriptor<Definition[T]['ChainId'], Definition[T]['ChainContextGetter']>
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
        : Web3StateShared<
              Definition[T]['ChainId'],
              Definition[T]['AddressType'],
              Definition[T]['SchemaType'],
              Definition[T]['ChainContextGetter'],
              Definition[T]['NetworkType'],
              Definition[T]['Signature'],
              Definition[T]['GasOption'],
              Definition[T]['Block'],
              Definition[T]['Operation'],
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
        : ConnectionOptions<Definition[T]['ChainId'], Definition[T]['ChainContextGetter'], Definition[T]['Transaction']>
    export type Web3ConnectionScope<
        S extends 'all' | void = void,
        T extends NetworkPluginID = NetworkPluginID,
    > = S extends 'all'
        ? Web3ConnectionAll
        : Connection<
              Definition[T]['ChainId'],
              Definition[T]['AddressType'],
              Definition[T]['SchemaType'],
              Definition[T]['ChainContextGetter'],
              Definition[T]['Signature'],
              Definition[T]['Block'],
              Definition[T]['Operation'],
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
        : Web3UIShared<Definition[T]['ChainId'], Definition[T]['ChainContextGetter'], Definition[T]['NetworkType']>
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
