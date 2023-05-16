import type { Subscription } from 'use-subscription'
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
    type TransactionReceipt,
    type TransactionDetailed,
    type TransactionSignature,
    type Web3Provider,
    type Operation,
    type AddressType,
} from '@masknet/web3-shared-solana'
import { createConnection } from './Connection/connection.js'
import { ConnectionState } from '../../Base/state/Connection.js'

export class Connection extends ConnectionState<
    ChainId,
    AddressType,
    SchemaType,
    ProviderType,
    Signature,
    Block,
    Operation,
    Transaction,
    TransactionReceipt,
    TransactionDetailed,
    TransactionSignature,
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
