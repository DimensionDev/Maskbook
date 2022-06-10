import type { Subscription } from 'use-subscription'
import type { Connection, ConnectionOptions, ConnectionState as Web3ConnectionState } from '@masknet/web3-shared-base'
import type { Plugin } from '../types'

export class ConnectionState<
    ChainId,
    SchemaType,
    ProviderType,
    Signature,
    Block,
    Transaction,
    TransactionReceipt,
    TransactionDetailed,
    TransactionSignature,
    Web3,
    Web3Provider,
    Web3ConnectionOptions extends ConnectionOptions<ChainId, ProviderType, Transaction> = ConnectionOptions<
        ChainId,
        ProviderType,
        Transaction
    >,
> implements
        Web3ConnectionState<
            ChainId,
            SchemaType,
            ProviderType,
            Signature,
            Block,
            Transaction,
            TransactionReceipt,
            TransactionDetailed,
            TransactionSignature,
            Web3,
            Web3Provider,
            Web3ConnectionOptions
        >
{
    constructor(
        private context: Plugin.Shared.SharedContext,
        protected createConnection: (
            context: Plugin.Shared.SharedContext,
            options?: {
                chainId?: ChainId
                account?: string
                providerType?: ProviderType
            },
        ) => Connection<
            ChainId,
            SchemaType,
            ProviderType,
            Signature,
            Block,
            Transaction,
            TransactionReceipt,
            TransactionDetailed,
            TransactionSignature,
            Web3,
            Web3Provider,
            Web3ConnectionOptions
        >,
        protected subscription: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
            providerType?: Subscription<ProviderType>
        },
    ) {}

    async getWeb3(options?: Web3ConnectionOptions) {
        const connection = await this.getConnection(options)
        return connection.getWeb3(options)
    }

    async getWeb3Provider(options?: Web3ConnectionOptions) {
        const connection = await this.getConnection(options)
        return connection.getWeb3Provider(options)
    }

    async getConnection(options?: Web3ConnectionOptions) {
        return this.createConnection(this.context, {
            chainId: options?.chainId ?? this.subscription.chainId?.getCurrentValue(),
            account: options?.account ?? this.subscription.account?.getCurrentValue(),
            providerType: options?.providerType ?? this.subscription.providerType?.getCurrentValue(),
        })
    }
}
