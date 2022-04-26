import { Connection as SolanaConnection, sendAndConfirmRawTransaction, Transaction } from '@solana/web3.js'
import { ChainId, deocdeAddress, ProviderType, SchemaType } from '@masknet/web3-shared-solana'
import { Providers } from './provider'
import type { SolanaConnection as BaseConnection, SolanaWeb3ConnectionOptions } from './types'
import { NETWORK_ENDPOINTS } from '../../constants'
import {
    ConnectionOptions,
    FungibleToken,
    NonFungibleToken,
    NonFungibleTokenCollection,
    NonFungibleTokenContract,
    TransactionStatusType,
} from '@masknet/web3-shared-base'

class Connection implements BaseConnection {
    private connections: Map<ChainId, SolanaConnection> = new Map()

    constructor(private chainId: ChainId, private account: string, private providerType: ProviderType) {}
    transferFungibleToken(
        address: string,
        amount: string,
        recipient: string,
        options?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    transferNonFungibleToken(
        address: string,
        tokenId: string,
        amount: string,
        recipient: string,
        options?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getGasPrice(options?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getSchemaType(
        address: string,
        options?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ): Promise<SchemaType> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenContract(
        address: string,
        options?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenCollection(
        address: string,
        options?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ): Promise<NonFungibleTokenCollection<ChainId>> {
        throw new Error('Method not implemented.')
    }
    getBlockTimestamp(options?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined): Promise<number> {
        throw new Error('Method not implemented.')
    }
    switchChain?:
        | ((options?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined) => Promise<void>)
        | undefined
    getNativeToken(options?: SolanaWeb3ConnectionOptions | undefined): Promise<FungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNativeTokenBalance(options?: SolanaWeb3ConnectionOptions | undefined): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getFungibleTokenBalance(address: string, options?: SolanaWeb3ConnectionOptions | undefined): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenBalance(address: string, options?: SolanaWeb3ConnectionOptions | undefined): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getCode(address: string, options?: SolanaWeb3ConnectionOptions | undefined): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getWeb3(options?: SolanaWeb3ConnectionOptions) {
        return this.getWeb3Provider(options).createWeb3(options?.chainId ?? this.chainId)
    }

    getWeb3Provider(options?: SolanaWeb3ConnectionOptions) {
        return Providers[options?.providerType ?? this.providerType]
    }

    getWeb3Connection(options?: SolanaWeb3ConnectionOptions) {
        const chainId = options?.chainId ?? this.chainId
        const connection = this.connections.get(chainId) ?? new SolanaConnection(NETWORK_ENDPOINTS[chainId])
        this.connections.set(chainId, connection)
        return connection
    }

    getAccount(options?: SolanaWeb3ConnectionOptions) {
        return Promise.resolve(options?.account ?? this.account)
    }

    getAccountInfo(account: string, options?: SolanaWeb3ConnectionOptions) {
        return this.getWeb3Connection(options).getAccountInfo(deocdeAddress(account))
    }

    getChainId(options?: SolanaWeb3ConnectionOptions) {
        return Promise.resolve(options?.chainId ?? this.chainId)
    }

    async getBlockNumber(options?: SolanaWeb3ConnectionOptions) {
        const response = await this.getWeb3Connection(options).getLatestBlockhash()
        return response.lastValidBlockHeight
    }

    async getBalance(account: string, options?: SolanaWeb3ConnectionOptions) {
        const balance = await this.getWeb3Connection(options).getBalance(deocdeAddress(account))
        return balance.toFixed()
    }

    getTransaction(id: string, options?: SolanaWeb3ConnectionOptions) {
        return this.getWeb3Connection(options).getTransaction(id)
    }

    async getTransactionStatus(id: string, options?: SolanaWeb3ConnectionOptions) {
        const response = await this.getWeb3Connection(options).getSignatureStatus(id)
        if (response.value?.err) return TransactionStatusType.FAILED
        if (response.value?.confirmations && response.value.confirmations > 0) return TransactionStatusType.SUCCEED
        return TransactionStatusType.NOT_DEPEND
    }

    signMessage(dataToSign: string, signType?: string, options?: SolanaWeb3ConnectionOptions) {
        return this.getWeb3Provider(options).signMessage(dataToSign)
    }

    verifyMessage(
        dataToVerify: string,
        signature: string,
        signType?: string,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<boolean> {
        return this.getWeb3Provider(options).verifyMessage(dataToVerify, signature)
    }

    async signTransaction(transaction: Transaction, options?: SolanaWeb3ConnectionOptions) {
        return this.getWeb3Provider(options).signTransaction(transaction)
    }

    signTransactions(transactions: Transaction[], options?: SolanaWeb3ConnectionOptions) {
        return Promise.all(transactions.map((x) => this.signTransaction(x)))
    }

    callTransaction(transaction: Transaction, options?: SolanaWeb3ConnectionOptions | undefined): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async sendTransaction(transaction: Transaction, options?: SolanaWeb3ConnectionOptions) {
        const signedTransaction = await this.signTransaction(transaction)
        return sendAndConfirmRawTransaction(this.getWeb3Connection(options), signedTransaction.serialize())
    }

    sendSignedTransaction(signature: Transaction, options?: SolanaWeb3ConnectionOptions) {
        return sendAndConfirmRawTransaction(this.getWeb3Connection(options), signature.serialize())
    }

    async getTransactionNonce(account: string, options?: SolanaWeb3ConnectionOptions): Promise<number> {
        const response = await this.getWeb3Connection(options).getNonce(deocdeAddress(account))
        return response?.nonce ? Number.parseInt(response.nonce) : 0
    }

    getFungibleToken(
        address: string,
        options?: SolanaWeb3ConnectionOptions | undefined,
    ): Promise<FungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleToken(
        address: string,
        id: string,
        options?: SolanaWeb3ConnectionOptions | undefined,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
}

export function createConnection(chainId = ChainId.Mainnet, account = '', providerType = ProviderType.Phantom) {
    return new Connection(chainId, account, providerType)
}
