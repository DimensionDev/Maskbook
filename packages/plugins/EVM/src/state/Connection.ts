import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { ConnectionState } from '@masknet/plugin-infra/web3'
import type {
    Block,
    ChainId,
    ProviderType,
    SchemaType,
    Signature,
    Transaction,
    TransactionDetailed,
    TransactionSignature,
    Web3,
    Web3Provider,
} from '@masknet/web3-shared-evm'
import { createConnection } from './Connection/connection'

export class Connection extends ConnectionState<
    ChainId,
    SchemaType,
    ProviderType,
    Signature,
    Block,
    Transaction,
    TransactionDetailed,
    TransactionSignature,
    Web3,
    Web3Provider
> {
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
