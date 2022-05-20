import type {
    Connection,
    ConnectionOptions,
    Hub,
    HubOptions,
    NetworkDescriptor,
    NetworkPluginID,
    ProtocolState,
    ProviderDescriptor,
    ProviderState,
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

    export type Web3ProviderState<T extends NetworkPluginID = never> = T extends never
        ? never
        : ProviderState<Definition[T]['ChainId'], Definition[T]['ProviderType'], Definition[T]['NetworkType']>

    export type Web3ProtocolState<T extends NetworkPluginID = never> = T extends never
        ? never
        : ProtocolState<
              Definition[T]['ChainId'],
              Definition[T]['SchemaType'],
              Definition[T]['ProviderType'],
              Definition[T]['Signature'],
              Definition[T]['Block'],
              Definition[T]['Transaction'],
              Definition[T]['TransactionDetailed'],
              Definition[T]['TransactionSignature'],
              Definition[T]['Web3']
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
              Definition[T]['TransactionDetailed'],
              Definition[T]['TransactionSignature'],
              Definition[T]['Web3']
          >
    export type Web3HubOptions<T extends NetworkPluginID = never> = T extends never
        ? never
        : HubOptions<Definition[T]['ChainId']>
    export type Web3Hub<T extends NetworkPluginID = never> = T extends never
        ? never
        : Hub<
              Definition[T]['ChainId'],
              Definition[T]['SchemaType'],
              Definition[T]['GasOption'],
              Definition[T]['Transaction']
          >
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
              Definition[T]['TransactionDetailed'],
              Definition[T]['TransactionSignature'],
              Definition[T]['TransactionParameter'],
              Definition[T]['Web3']
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
    export type TransactionDetailedAll = Definition[NetworkPluginID]['TransactionDetailed']
    export type TransactionSignatureAll = Definition[NetworkPluginID]['TransactionSignature']
    export type TransactionParameterAll = Definition[NetworkPluginID]['TransactionParameter']
    export type Web3All = Definition[NetworkPluginID]['Web3']

    export type NetworkDescriptorAll = NetworkDescriptor<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['NetworkType']
    >

    export type ProviderDescriptorAll = ProviderDescriptor<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['ProviderType']
    >

    export type Web3ConnectionAll = Connection<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['SchemaType'],
        Definition[NetworkPluginID]['ProviderType'],
        Definition[NetworkPluginID]['Signature'],
        Definition[NetworkPluginID]['Block'],
        Definition[NetworkPluginID]['Transaction'],
        Definition[NetworkPluginID]['TransactionDetailed'],
        Definition[NetworkPluginID]['TransactionSignature'],
        Definition[NetworkPluginID]['Web3']
    >
    export type Web3HubAll = Hub<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['SchemaType'],
        Definition[NetworkPluginID]['GasOption'],
        Definition[NetworkPluginID]['Transaction']
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
        Definition[NetworkPluginID]['TransactionDetailed'],
        Definition[NetworkPluginID]['TransactionSignature'],
        Definition[NetworkPluginID]['TransactionParameter'],
        Definition[NetworkPluginID]['Web3']
    >

    export type Web3UIAll = Web3Plugin.UI.UI<
        Definition[NetworkPluginID]['ChainId'],
        Definition[NetworkPluginID]['ProviderType'],
        Definition[NetworkPluginID]['NetworkType']
    >
}
