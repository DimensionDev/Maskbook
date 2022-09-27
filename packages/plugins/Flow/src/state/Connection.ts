import type { Subscription } from 'use-subscription'
import type { CurrentUserObject } from '@blocto/fcl'
import type { Plugin } from '@masknet/plugin-infra'
import { ConnectionState } from '@masknet/plugin-infra/web3'
import type {
    AddressType,
    Block,
    ChainId,
    GasOption,
    Operation,
    ProviderType,
    SchemaType,
    Signature,
    Transaction,
    TransactionDetailed,
    Web3,
    Web3Provider,
} from '@masknet/web3-shared-flow'
import { createConnection } from './Connection/connection.js'

export interface ConnectionStorage {
    chainId: ChainId
    user: CurrentUserObject | null
}

export class Connection extends ConnectionState<
    ChainId,
    AddressType,
    SchemaType,
    ProviderType,
    Signature,
    GasOption,
    Block,
    Operation,
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
