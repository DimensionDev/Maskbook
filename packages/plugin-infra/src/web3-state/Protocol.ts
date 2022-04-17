import type { Subscription } from 'use-subscription'
import type { Web3Plugin } from '../web3-types'

export class ProtocolState<
    ChainId extends number,
    ProviderType,
    Signature,
    Transaction,
    TransactionDetailed,
    TransactionSignature,
    Web3,
    Web3Options extends Web3Plugin.ConnectionOptions<ChainId, ProviderType, Transaction> = Web3Plugin.ConnectionOptions<
        ChainId,
        ProviderType,
        Transaction
    >,
> implements
        Web3Plugin.ObjectCapabilities.ProtocolState<
            ChainId,
            ProviderType,
            Signature,
            Transaction,
            TransactionDetailed,
            TransactionSignature,
            Web3,
            Web3Options
        >
{
    constructor(
        protected createConnection: (
            account?: string,
            chainId?: ChainId,
            providerType?: ProviderType,
        ) => Web3Plugin.Connection<
            ChainId,
            ProviderType,
            Signature,
            Transaction,
            TransactionDetailed,
            TransactionSignature,
            Web3,
            Web3Options
        >,
        protected subscription: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
            providerType?: Subscription<ProviderType>
        },
    ) {}

    getConnection(options?: Web3Options) {
        return this.createConnection(
            options?.account ?? this.subscription.account?.getCurrentValue(),
            options?.chainId ?? this.subscription.chainId?.getCurrentValue(),
            options?.providerType ?? this.subscription.providerType?.getCurrentValue(),
        )
    }

    getWeb3(options?: Web3Options) {
        return this.getConnection(options).getWeb3(options)
    }

    getAccount(options?: Web3Options) {
        return this.getConnection(options).getAccount(options)
    }

    getChainId(options?: Web3Options) {
        return this.getConnection(options).getChainId(options)
    }

    getLatestBalance(account: string, options?: Web3Options) {
        return this.getConnection(options).getBalance(account, options)
    }

    getLatestBlockNumber(options?: Web3Options) {
        return this.getConnection(options).getBlockNumber(options)
    }

    getTransactionStatus(id: string, options?: Web3Options) {
        return this.getConnection(options).getTransactionStatus(id, options)
    }

    signMessage(message: string, signType?: string | undefined, options?: Web3Options) {
        return this.getConnection(options).signMessage(message, signType, options)
    }

    verifyMessage(message: string, signature: Signature, signType?: string | undefined, options?: Web3Options) {
        return this.getConnection(options).verifyMessage(message, signature, signType, options)
    }

    signTransaction(transaction: Transaction, options?: Web3Options) {
        return this.getConnection(options).signTransaction(transaction, options)
    }

    async sendTransaction(transaction: Transaction, options?: Web3Options) {
        const connection = this.getConnection(options)
        const signedTransaction = await connection.signTransaction(transaction, options)
        return connection.sendSignedTransaction(signedTransaction, options)
    }

    sendSignedTransaction(signature: TransactionSignature, options?: Web3Options) {
        return this.getConnection(options).sendSignedTransaction(signature, options)
    }

    addChain(options?: Web3Options) {
        if (!options?.chainId) throw new Error('Unknown chain Id.')
        return this.getConnection(options).addChain(options.chainId, options)
    }

    switchChain(options?: Web3Options) {
        if (!options?.chainId) throw new Error('Unknown chain Id.')
        return this.getConnection(options).switchChain(options.chainId, options)
    }
}
