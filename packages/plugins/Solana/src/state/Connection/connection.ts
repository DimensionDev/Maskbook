import {
    BlockResponse,
    Connection as SolanaConnection,
    sendAndConfirmRawTransaction,
    Transaction,
} from '@solana/web3.js'
import { ChainId, decodeAddress, ProviderType, SchemaType } from '@masknet/web3-shared-solana'
import { Providers } from './provider'
import type { SolanaConnection as BaseConnection, SolanaWeb3ConnectionOptions } from './types'
import { NETWORK_ENDPOINTS } from '../../constants'
import {
    Account,
    ConnectionOptions,
    FungibleToken,
    NonFungibleToken,
    NonFungibleTokenCollection,
    NonFungibleTokenContract,
    NonFungibleTokenMetadata,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import { Web3StateSettings } from '../../settings'
import type { Plugin } from '@masknet/plugin-infra'

class Connection implements BaseConnection {
    private connections: Map<ChainId, SolanaConnection> = new Map()

    constructor(
        private chainId: ChainId,
        private account: string,
        private providerType: ProviderType,
        private context?: Plugin.Shared.SharedContext,
    ) {}

    private _getWeb3Provider(options?: SolanaWeb3ConnectionOptions) {
        return Providers[options?.providerType ?? this.providerType]
    }

    async getWeb3(options?: SolanaWeb3ConnectionOptions) {
        return this._getWeb3Provider(options).createWeb3({
            account: options?.account ?? this.account,
            chainId: options?.chainId ?? this.chainId,
        })
    }

    getWeb3Provider(options?: SolanaWeb3ConnectionOptions) {
        return this._getWeb3Provider(options).createWeb3Provider({
            account: options?.account ?? this.account,
            chainId: options?.chainId ?? this.chainId,
        })
    }

    async connect(options?: SolanaWeb3ConnectionOptions): Promise<Account<ChainId>> {
        return {
            account: '',
            chainId: ChainId.Mainnet,
            ...(await Web3StateSettings.value.Provider?.connect(
                options?.chainId ?? this.chainId,
                options?.providerType ?? this.providerType,
            )),
        }
    }
    async disconnect(options?: SolanaWeb3ConnectionOptions): Promise<void> {
        await Web3StateSettings.value.Provider?.disconnect(options?.providerType ?? this.providerType)
    }
    transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    transferNonFungibleToken(
        address: string,
        tokenId: string,
        amount: string,
        recipient: string,
        schemaType?: SchemaType,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getGasPrice(options?: SolanaWeb3ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getSchemaType(address: string, options?: SolanaWeb3ConnectionOptions): Promise<SchemaType> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenContract(
        address: string,
        tokenId?: string,
        schemaType?: SchemaType,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenCollection(
        address: string,
        tokenId?: string,
        schemaType?: SchemaType,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<NonFungibleTokenCollection<ChainId>> {
        throw new Error('Method not implemented.')
    }
    async switchChain(options?: SolanaWeb3ConnectionOptions) {
        await Providers[options?.providerType ?? this.providerType].switchChain(options?.chainId)
    }
    getNativeToken(options?: SolanaWeb3ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNativeTokenBalance(options?: SolanaWeb3ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getFungibleTokenBalance(address: string, options?: SolanaWeb3ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenBalance(
        address: string,
        tokenId?: string,
        schemaType?: SchemaType,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getFungibleTokensBalance(
        listOfAddress: string[],
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokensBalance(
        listOfAddress: string[],
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }
    getCode(address: string, options?: SolanaWeb3ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
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
        return this.getWeb3Connection(options).getAccountInfo(decodeAddress(account))
    }

    getChainId(options?: SolanaWeb3ConnectionOptions) {
        return Promise.resolve(options?.chainId ?? this.chainId)
    }

    async getBlock(no: number, options?: SolanaWeb3ConnectionOptions): Promise<BlockResponse | null> {
        return this.getWeb3Connection(options).getBlock(no)
    }

    async getBlockNumber(options?: SolanaWeb3ConnectionOptions) {
        return this.getWeb3Connection(options).getSlot()
    }

    async getBlockTimestamp(options?: SolanaWeb3ConnectionOptions): Promise<number> {
        const slot = await this.getBlockNumber(options)
        const response = await this.getWeb3Connection(options).getBlockTime(slot)
        return response ?? 0
    }

    async getBalance(account: string, options?: SolanaWeb3ConnectionOptions) {
        const balance = await this.getWeb3Connection(options).getBalance(decodeAddress(account))
        return balance.toFixed()
    }

    getTransaction(id: string, options?: SolanaWeb3ConnectionOptions) {
        return this.getWeb3Connection(options).getTransaction(id)
    }

    async getTransactionReceipt(id: string, options?: SolanaWeb3ConnectionOptions) {
        return null
    }

    async getTransactionStatus(id: string, options?: SolanaWeb3ConnectionOptions) {
        const response = await this.getWeb3Connection(options).getSignatureStatus(id)
        if (response.value?.err) return TransactionStatusType.FAILED
        if (response.value?.confirmations && response.value.confirmations > 0) return TransactionStatusType.SUCCEED
        return TransactionStatusType.NOT_DEPEND
    }

    async signMessage(dataToSign: string, signType?: string, options?: SolanaWeb3ConnectionOptions) {
        return this._getWeb3Provider(options).signMessage(dataToSign)
    }

    async verifyMessage(
        dataToVerify: string,
        signature: string,
        signType?: string,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<boolean> {
        return this._getWeb3Provider(options).verifyMessage(dataToVerify, signature)
    }

    async signTransaction(transaction: Transaction, options?: SolanaWeb3ConnectionOptions) {
        return this._getWeb3Provider(options).signTransaction(transaction)
    }

    signTransactions(transactions: Transaction[], options?: SolanaWeb3ConnectionOptions) {
        return Promise.all(transactions.map((x) => this.signTransaction(x)))
    }

    callTransaction(transaction: Transaction, options?: SolanaWeb3ConnectionOptions): Promise<string> {
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
        const response = await this.getWeb3Connection(options).getNonce(decodeAddress(account))
        return response?.nonce ? Number.parseInt(response.nonce, 10) : 0
    }

    getFungibleToken(
        address: string,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<FungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleToken(
        address: string,
        tokenId: string,
        schemaType?: SchemaType,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenMetadata(
        address: string,
        tokenId: string,
        schemaType?: SchemaType,
        options?: SolanaWeb3ConnectionOptions,
    ): Promise<NonFungibleTokenMetadata<ChainId>> {
        throw new Error('Method not implemented.')
    }
    replaceRequest(
        hash: string,
        config: Transaction,
        options?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ): Promise<void> {
        throw new Error('Method not implemented.')
    }
    cancelRequest(
        hash: string,
        config: Transaction,
        options?: ConnectionOptions<ChainId, ProviderType, Transaction> | undefined,
    ): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

export function createConnection(
    context: Plugin.Shared.SharedContext,
    options?: {
        chainId?: ChainId
        account?: string
        providerType?: ProviderType
    },
) {
    const { chainId = ChainId.Mainnet, account = '', providerType = ProviderType.Phantom } = options ?? {}

    return new Connection(chainId, account, providerType, context)
}
