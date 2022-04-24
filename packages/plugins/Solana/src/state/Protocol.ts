import type { Subscription } from 'use-subscription'
import type { default as Web3, Transaction, TransactionResponse } from '@solana/web3.js'
import type { Plugin } from '@masknet/plugin-infra'
import { ProtocolState, Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId, ProviderType, SchemaType } from '@masknet/web3-shared-solana'
import { createConnection } from './Protocol/connection'

export class Protocol
    extends ProtocolState<
        ChainId,
        SchemaType,
        ProviderType,
        string,
        Transaction,
        TransactionResponse,
        Transaction,
        typeof Web3
    >
    implements
        Web3Plugin.ObjectCapabilities.ProtocolState<
            ChainId,
            SchemaType,
            ProviderType,
            string,
            Transaction,
            TransactionResponse,
            Transaction,
            typeof Web3
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
