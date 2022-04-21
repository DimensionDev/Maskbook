import type * as fcl from '@blocto/fcl'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId, ProviderType, NetworkType, FclProvider } from '@masknet/web3-shared-flow'

export type FlowWeb3 = typeof fcl

export type FlowWeb3State = Web3Plugin.ObjectCapabilities.Capabilities<
    ChainId,
    ProviderType,
    NetworkType,
    fcl.CompositeSignature[],
    fcl.MutateOptions,
    fcl.TransactionObject,
    never,
    FlowWeb3
>

export interface FlowProvider extends Web3Plugin.Provider<ChainId, FclProvider, FlowWeb3> {}

export interface FlowConnection
    extends Web3Plugin.Connection<
        ChainId,
        ProviderType,
        fcl.CompositeSignature[],
        fcl.MutateOptions,
        fcl.TransactionObject,
        never,
        FlowWeb3
    > {}

export type FlowConnectionOptions = Web3Plugin.ConnectionOptions<ChainId, ProviderType, fcl.MutateOptions> & {}
