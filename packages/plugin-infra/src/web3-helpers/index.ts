import type { NetworkPluginID, Web3Plugin } from '../web3-types'
import type * as EVM from '@masknet/web3-shared-evm'
import type * as Flow from '@masknet/web3-shared-flow'
import type * as Solana from '@masknet/web3-shared-solana'

export declare namespace Web3Helper {
    export type Definition = {
        [NetworkPluginID.PLUGIN_EVM]: {
            ChainId: EVM.ChainId
            SchemaType: EVM.SchemaType
            ProviderType: EVM.ProviderType
            NetworkType: EVM.NetworkType
            Signature: EVM.Signature
            Transaction: EVM.Transaction
            TransactionDetailed: EVM.TransactionDetailed
            TransactionSignature: EVM.TransactionSignature
            TransactionParameter: EVM.TransactionParameter
            Web3: EVM.Web3
        }
        [NetworkPluginID.PLUGIN_FLOW]: {
            ChainId: Flow.ChainId
            SchemaType: Flow.SchemaType
            ProviderType: Flow.ProviderType
            NetworkType: Flow.NetworkType
            Signature: Flow.Signature
            Transaction: Flow.Transaction
            TransactionDetailed: Flow.TransactionDetailed
            TransactionSignature: Flow.TransactionSignature
            TransactionParameter: Flow.TransactionParameter
            Web3: Flow.Web3
        }
        [NetworkPluginID.PLUGIN_SOLANA]: {
            ChainId: Solana.ChainId
            SchemaType: Solana.SchemaType
            ProviderType: Solana.ProviderType
            NetworkType: Solana.NetworkType
            Signature: Solana.Signature
            Transaction: Solana.Transaction
            TransactionDetailed: Solana.TransactionDetailed
            TransactionSignature: Solana.TransactionSignature
            TransactionParameter: Solana.TransactionParameter
            Web3: Solana.Web3
        }
    }

    export type Web3ConnectionOptions<T extends NetworkPluginID = never> = T extends never
        ? Web3Plugin.ConnectionOptions<number, string, unknown>
        : Web3Plugin.ConnectionOptions<
              Definition[T]['ChainId'],
              Definition[T]['ProviderType'],
              Definition[T]['Transaction']
          >

    export type Web3Connection<T extends NetworkPluginID = never> = T extends never
        ? Web3Plugin.Connection<number, string, string, string, unknown, unknown, string, unknown>
        : Web3Plugin.Connection<
              Definition[T]['ChainId'],
              Definition[T]['SchemaType'],
              Definition[T]['ProviderType'],
              Definition[T]['Signature'],
              Definition[T]['Transaction'],
              Definition[T]['TransactionDetailed'],
              Definition[T]['TransactionSignature'],
              Definition[T]['Web3']
          >

    export type Web3State<T extends NetworkPluginID = never> = T extends never
        ? Web3Plugin.ObjectCapabilities.Capabilities<
              number,
              string,
              string,
              string,
              string,
              unknown,
              unknown,
              string,
              unknown,
              unknown
          >
        : Web3Plugin.ObjectCapabilities.Capabilities<
              Definition[T]['ChainId'],
              Definition[T]['SchemaType'],
              Definition[T]['ProviderType'],
              Definition[T]['NetworkType'],
              Definition[T]['Signature'],
              Definition[T]['Transaction'],
              Definition[T]['TransactionDetailed'],
              Definition[T]['TransactionSignature'],
              Definition[T]['TransactionParameter'],
              Definition[T]['Web3']
          >

    export type Web3UI<T extends NetworkPluginID = never> = T extends never
        ? Web3Plugin.UI.UI<number, string, string>
        : Web3Plugin.UI.UI<Definition[T]['ChainId'], Definition[T]['ProviderType'], Definition[T]['NetworkType']>
}
