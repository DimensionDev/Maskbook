import { memoize } from 'lodash-es'
import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import type { Connection, ConnectionOptions, ConnectionState as Web3ConnectionState } from '@masknet/web3-shared-base'

export class ConnectionState<
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
    Web3Provider,
    Web3ConnectionOptions extends ConnectionOptions<ChainId, ProviderType, Transaction> = ConnectionOptions<
        ChainId,
        ProviderType,
        Transaction
    >,
> implements
        Web3ConnectionState<
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
            Web3Provider,
            Web3ConnectionOptions
        >
{
    private createConnectionCached: (ReturnType<typeof memoize> & typeof this.createConnection) | undefined

    constructor(
        protected context: Plugin.Shared.SharedUIContext,
        protected createConnection: (
            context: Plugin.Shared.SharedUIContext,
            options?: {
                chainId?: ChainId
                account?: string
                providerType?: ProviderType
            },
        ) => Connection<
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
            Web3Provider,
            Web3ConnectionOptions
        >,
        protected subscription: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
            providerType?: Subscription<ProviderType>
        },
        protected options: {
            isValidChainId(chainId?: ChainId): boolean
            getDefaultChainId(): ChainId
            getDefaultProviderType(): ProviderType
        },
    ) {
        this.createConnectionCached = memoize(
            (
                context: Plugin.Shared.SharedUIContext,
                options?: {
                    chainId?: ChainId
                    account?: string
                    providerType?: ProviderType
                },
            ) => {
                return this.createConnection(context, options)
            },
            (
                context: Plugin.Shared.SharedUIContext,
                options?: {
                    chainId?: ChainId
                    account?: string
                    providerType?: ProviderType
                },
            ) => {
                return [options?.chainId, options?.account, options?.providerType].join(',')
            },
        )
    }

    getWeb3(options?: Web3ConnectionOptions) {
        const connection = this.getConnection(options)
        return connection?.getWeb3(options)
    }

    getWeb3Provider(options?: Web3ConnectionOptions) {
        const connection = this.getConnection(options)
        return connection.getWeb3Provider(options)
    }

    getConnection(options?: Web3ConnectionOptions) {
        const account = options?.account || this.subscription.account?.getCurrentValue()
        const chainId =
            options?.chainId || this.subscription.chainId?.getCurrentValue() || this.options.getDefaultChainId()
        const providerType =
            options?.providerType ||
            this.subscription.providerType?.getCurrentValue() ||
            this.options.getDefaultProviderType()

        if (!this.options.isValidChainId(chainId)) return
        return this.createConnectionCached?.(this.context, {
            account,
            chainId,
            providerType,
        })
    }
}
