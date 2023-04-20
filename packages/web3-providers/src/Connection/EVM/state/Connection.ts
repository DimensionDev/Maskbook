import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import {
    isValidChainId,
    getDefaultChainId,
    getDefaultProviderType,
    type AddressType,
    type Block,
    type ChainId,
    type UserOperation,
    type ProviderType,
    type SchemaType,
    type Signature,
    type Transaction,
    type TransactionDetailed,
    type TransactionReceipt,
    type TransactionSignature,
    type Web3,
    type Web3Provider,
} from '@masknet/web3-shared-evm'
import { createConnection } from './Connection/connection.js'
import { ConnectionState } from '../../Base/state/Connection.js'

export class Connection extends ConnectionState<
    ChainId,
    AddressType,
    SchemaType,
    ProviderType,
    Signature,
    Block,
    UserOperation,
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
