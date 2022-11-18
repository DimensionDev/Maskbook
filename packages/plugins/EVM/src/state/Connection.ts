import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { ConnectionState } from '@masknet/web3-state'
import {
    isValidChainId,
    getDefaultChainId,
    getDefaultProviderType,
    AddressType,
    Block,
    ChainId,
    UserTransaction,
    ProviderType,
    SchemaType,
    Signature,
    Transaction,
    TransactionDetailed,
    TransactionReceipt,
    TransactionSignature,
    Web3,
    Web3Provider,
} from '@masknet/web3-shared-evm'
import { createConnection } from './Connection/connection.js'

export class Connection extends ConnectionState<
    ChainId,
    AddressType,
    SchemaType,
    ProviderType,
    Signature,
    Block,
    UserTransaction,
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
