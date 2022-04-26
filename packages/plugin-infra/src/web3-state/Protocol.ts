import type { Subscription } from 'use-subscription'
import type { Connection, ConnectionOptions, ProtocolState as Web3ProtocolState } from '@masknet/web3-shared-base'

export class ProtocolState<
    ChainId,
    SchemaType,
    ProviderType,
    Signature,
    Transaction,
    TransactionDetailed,
    TransactionSignature,
    Web3,
    Web3ConnectionOptions extends ConnectionOptions<ChainId, ProviderType, Transaction> = ConnectionOptions<
        ChainId,
        ProviderType,
        Transaction
    >,
> implements
        Web3ProtocolState<
            ChainId,
            SchemaType,
            ProviderType,
            Signature,
            Transaction,
            TransactionDetailed,
            TransactionSignature,
            Web3,
            Web3ConnectionOptions
        >
{
    constructor(
        protected createConnection: (
            chainId?: ChainId,
            account?: string,
            providerType?: ProviderType,
        ) => Connection<
            ChainId,
            SchemaType,
            ProviderType,
            Signature,
            Transaction,
            TransactionDetailed,
            TransactionSignature,
            Web3,
            Web3ConnectionOptions
        >,
        protected subscription: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
            providerType?: Subscription<ProviderType>
        },
    ) {}

    async getConnection(options?: Web3ConnectionOptions) {
        return this.createConnection(
            options?.chainId ?? this.subscription.chainId?.getCurrentValue(),
            options?.account ?? this.subscription.account?.getCurrentValue(),
            options?.providerType ?? this.subscription.providerType?.getCurrentValue(),
        )
    }

    async getWeb3(options?: Web3ConnectionOptions) {
        const connection = await this.getConnection(options)
        return connection.getWeb3(options)
    }
}
