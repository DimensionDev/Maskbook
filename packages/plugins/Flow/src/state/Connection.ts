import type { Subscription } from 'use-subscription'
import type { CurrentUserObject } from '@blocto/fcl'
import type { Plugin } from '@masknet/plugin-infra'
import { ConnectionState } from '@masknet/plugin-infra/web3'
import type {
    ChainId,
    ProviderType,
    SchemaType,
    Web3,
    Signature,
    Block,
    Transaction,
    TransactionDetailed,
    Web3Provider,
} from '@masknet/web3-shared-flow'
import { createConnection } from './Connection/connection'

export interface ConnectionStorage {
    chainId: ChainId
    user: CurrentUserObject | null
}

export class Connection extends ConnectionState<
    ChainId,
    SchemaType,
    ProviderType,
    Signature,
    Block,
    Transaction,
    never,
    TransactionDetailed,
    never,
    Web3,
    Web3Provider
> {
    constructor(
        context: Plugin.Shared.SharedUIContext,
        subscription: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
            providerType?: Subscription<ProviderType>
        },
    ) {
        super(context, createConnection, subscription)
    }
}
