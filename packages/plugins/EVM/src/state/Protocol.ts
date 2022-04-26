import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { ProtocolState } from '@masknet/plugin-infra/web3'
import type {
    ChainId,
    ProviderType,
    SchemaType,
    Signature,
    Transaction,
    TransactionDetailed,
    TransactionSignature,
    Web3,
} from '@masknet/web3-shared-evm'
import { createConnection } from './Protocol/connection'

export class Protocol extends ProtocolState<
    ChainId,
    SchemaType,
    ProviderType,
    Signature,
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
