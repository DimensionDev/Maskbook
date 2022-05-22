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
} from '@masknet/web3-shared-evm'
import { createConnection } from './Connection/connection'

export class Protocol extends ConnectionState<
    ChainId,
    SchemaType,
    ProviderType,
    Signature,
    Block,
    Transaction,
    TransactionDetailed,
    TransactionSignature,
    Web3
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
