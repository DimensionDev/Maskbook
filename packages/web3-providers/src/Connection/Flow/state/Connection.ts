import type { Subscription } from 'use-subscription'
import type { CurrentUserObject } from '@blocto/fcl'
import type { Plugin } from '@masknet/plugin-infra'
import {
    isValidChainId,
    getDefaultChainId,
    getDefaultProviderType,
    type ChainId,
    type ProviderType,
    type SchemaType,
    type Web3,
    type Signature,
    type Block,
    type Transaction,
    type TransactionDetailed,
    type Web3Provider,
    type Operation,
    type AddressType,
} from '@masknet/web3-shared-flow'
import { createConnection } from './Connection/connection.js'
import { ConnectionState } from '../../Base/state/Connection.js'

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
        super(context, createConnection, subscription, {
            isValidChainId,
            getDefaultChainId,
            getDefaultProviderType,
        })
    }
}
