import type { Subscription } from 'use-subscription'
import type { CompositeSignature, CurrentUserObject, MutateOptions, TransactionObject } from '@blocto/fcl'
import type { Plugin } from '@masknet/plugin-infra'
import { ProtocolState, Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId, ProviderType, SchemaType } from '@masknet/web3-shared-flow'
import type { FlowWeb3 } from './Protocol/types'
import { createConnection } from './Protocol/connection'

export interface ProtocolStorage {
    chainId: ChainId
    user: CurrentUserObject | null
}

export class Protocol
    extends ProtocolState<
        ChainId,
        SchemaType,
        ProviderType,
        CompositeSignature[],
        MutateOptions,
        TransactionObject,
        never,
        FlowWeb3
    >
    implements
        Web3Plugin.ObjectCapabilities.ProtocolState<
            ChainId,
            SchemaType,
            ProviderType,
            CompositeSignature[],
            MutateOptions,
            TransactionObject,
            never,
            FlowWeb3
        >
{
    constructor(
        private context: Plugin.Shared.SharedContext,
        subscription: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
            providerType?: Subscription<ProviderType>
        },
    ) {
        super(createConnection, subscription)
    }
}
