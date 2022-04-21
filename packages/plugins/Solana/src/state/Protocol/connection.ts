import { Connection as SolanaConnection, sendAndConfirmRawTransaction, Transaction } from '@solana/web3.js'
import { TransactionStatusType } from '@masknet/plugin-infra/src/entry-web3'
import { ChainId, deocdeAddress, ProviderType } from '@masknet/web3-shared-solana'
import { Providers } from './provider'
import type { SolanaConnection as BaseConnection, SolanaConnectionOptions } from './types'
import { NETWORK_ENDPOINTS } from '../../constants'

class Connection implements BaseConnection {
    private connections: Map<ChainId, SolanaConnection> = new Map()

    constructor(private account: string, private chainId: ChainId, private providerType: ProviderType) {}

    getWeb3(options?: SolanaConnectionOptions) {
        return this.getWeb3Provider(options).createWeb3(options?.chainId ?? this.chainId)
    }

    getWeb3Provider(options?: SolanaConnectionOptions) {
        return Providers[options?.providerType ?? this.providerType]
    }

    getWeb3Connection(options?: SolanaConnectionOptions) {
        const chainId = options?.chainId ?? this.chainId
        const connection = this.connections.get(chainId) ?? new SolanaConnection(NETWORK_ENDPOINTS[chainId])
        this.connections.set(chainId, connection)
        return connection
    }

    getAccount(options?: SolanaConnectionOptions) {
        return Promise.resolve(options?.account ?? this.account)
    }

    getAccountInfo(account: string, options?: SolanaConnectionOptions) {
        return this.getWeb3Connection(options).getAccountInfo(deocdeAddress(account))
    }

    getChainId(options?: SolanaConnectionOptions) {
        return Promise.resolve(options?.chainId ?? this.chainId)
    }

    async getBlockNumber(options?: SolanaConnectionOptions) {
        const response = await this.getWeb3Connection(options).getLatestBlockhash()
        return response.lastValidBlockHeight
    }

    async getBalance(account: string, options?: SolanaConnectionOptions) {
        const balance = await this.getWeb3Connection(options).getBalance(deocdeAddress(account))
        return balance.toFixed()
    }

    getTransaction(id: string, options?: SolanaConnectionOptions) {
        return this.getWeb3Connection(options).getTransaction(id)
    }

    async getTransactionStatus(id: string, options?: SolanaConnectionOptions) {
        const response = await this.getWeb3Connection(options).getSignatureStatus(id)
        if (response.value?.err) return TransactionStatusType.FAILED
        if (response.value?.confirmations && response.value.confirmations > 0) return TransactionStatusType.SUCCEED
        return TransactionStatusType.NOT_DEPEND
    }

    signMessage(dataToSign: string, signType?: string, options?: SolanaConnectionOptions) {
        return this.getWeb3Provider(options).signMessage(dataToSign)
    }

    verifyMessage(
        dataToVerify: string,
        signature: string,
        signType?: string,
        options?: SolanaConnectionOptions,
    ): Promise<boolean> {
        return this.getWeb3Provider(options).verifyMessage(dataToVerify, signature)
    }

    async signTransaction(transaction: Transaction, options?: SolanaConnectionOptions) {
        return this.getWeb3Provider(options).signTransaction(transaction)
    }

    signTransactions(transactions: Transaction[], options?: SolanaConnectionOptions) {
        return Promise.all(transactions.map((x) => this.signTransaction(x)))
    }

    async sendTransaction(transaction: Transaction, options?: SolanaConnectionOptions) {
        const signedTransaction = await this.signTransaction(transaction)
        return sendAndConfirmRawTransaction(this.getWeb3Connection(options), signedTransaction.serialize())
    }

    sendSignedTransaction(signature: Transaction, options?: SolanaConnectionOptions) {
        return sendAndConfirmRawTransaction(this.getWeb3Connection(options), signature.serialize())
    }

    async getTransactionNonce(account: string, options?: SolanaConnectionOptions): Promise<number> {
        const response = await this.getWeb3Connection(options).getNonce(deocdeAddress(account))
        return response?.nonce ? Number.parseInt(response.nonce) : 0
    }

    watchTransaction(id: string, transaction: Transaction, options?: SolanaConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    unwatchTransaction(id: string, options?: SolanaConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    addChain(chainId: ChainId): Promise<void> {
        throw new Error('Method not implemented.')
    }

    switchChain(chainId: ChainId): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

export function createConnection(account = '', chainId = ChainId.Mainnet, providerType = ProviderType.Phantom) {
    return new Connection(account, chainId, providerType)
}
