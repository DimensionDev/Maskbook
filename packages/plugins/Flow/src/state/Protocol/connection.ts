import { first } from 'lodash-unified'
import { unreachable } from '@dimensiondev/kit'
import { CompositeSignature, TransactionStatusCode, MutateOptions, QueryOptions } from '@blocto/fcl'
import { ChainId, ProviderType, SchemaType } from '@masknet/web3-shared-flow'
import {
    Account,
    ConnectionOptions,
    FungibleToken,
    NonFungibleToken,
    NonFungibleTokenCollection,
    NonFungibleTokenContract,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import { Providers } from './provider'
import type { FlowWeb3Connection as BaseConnection, FlowConnectionOptions } from './types'

class Connection implements BaseConnection {
    constructor(private chainId: ChainId, private account: string, private providerType: ProviderType) {}

    connect(options?: ConnectionOptions<ChainId, ProviderType, MutateOptions> | undefined): Promise<Account<ChainId>> {
        throw new Error('Method not implemented.')
    }
    disconnect(options?: ConnectionOptions<ChainId, ProviderType, MutateOptions> | undefined): Promise<void> {
        throw new Error('Method not implemented.')
    }
    getGasPrice(options?: ConnectionOptions<ChainId, ProviderType, MutateOptions> | undefined): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getSchemaType(
        address: string,
        options?: ConnectionOptions<ChainId, ProviderType, MutateOptions> | undefined,
    ): Promise<SchemaType> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenContract(
        address: string,
        options?: ConnectionOptions<ChainId, ProviderType, MutateOptions> | undefined,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenCollection(
        address: string,
        options?: ConnectionOptions<ChainId, ProviderType, MutateOptions> | undefined,
    ): Promise<NonFungibleTokenCollection<ChainId>> {
        throw new Error('Method not implemented.')
    }
    getBlockTimestamp(options?: ConnectionOptions<ChainId, ProviderType, MutateOptions> | undefined): Promise<number> {
        throw new Error('Method not implemented.')
    }
    transferFungibleToken(
        address: string,
        amount: string,
        recipient: string,
        options?: ConnectionOptions<ChainId, ProviderType, MutateOptions> | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    transferNonFungibleToken(
        address: string,
        tokenId: string,
        amount: string,
        recipient: string,
        options?: ConnectionOptions<ChainId, ProviderType, MutateOptions> | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getNativeToken(
        options?: ConnectionOptions<ChainId, ProviderType, MutateOptions> | undefined,
    ): Promise<FungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNativeTokenBalance(
        options?: ConnectionOptions<ChainId, ProviderType, MutateOptions> | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getFungibleTokenBalance(
        address: string,
        options?: ConnectionOptions<ChainId, ProviderType, MutateOptions> | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenBalance(
        address: string,
        options?: ConnectionOptions<ChainId, ProviderType, MutateOptions> | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getCode(
        address: string,
        options?: ConnectionOptions<ChainId, ProviderType, MutateOptions> | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getFungibleToken(address: string, options?: FlowConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleToken(
        address: string,
        id: string,
        options?: FlowConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }

    getWeb3(options?: FlowConnectionOptions) {
        return Providers[options?.providerType ?? this.providerType].createWeb3(options?.chainId ?? this.chainId)
    }
    async getAccount(options?: FlowConnectionOptions): Promise<string> {
        const web3 = await this.getWeb3(options)
        return web3.currentUser().addr ?? ''
    }
    async getChainId(options?: FlowConnectionOptions): Promise<ChainId> {
        return options?.chainId ?? this.chainId
    }
    async getBlockNumber(options?: FlowConnectionOptions): Promise<number> {
        const web3 = await this.getWeb3(options)
        const blockHeader = await web3.getBlockHeader()
        return blockHeader.height
    }
    async getBalance(address: string, options?: FlowConnectionOptions): Promise<string> {
        const web3 = await this.getWeb3(options)
        const account = await web3.getAccount(address)
        return account.balance.toFixed()
    }
    async getTransaction(id: string, options?: FlowConnectionOptions) {
        const web3 = await this.getWeb3(options)
        return web3.getTransaction(id)
    }
    async getTransactionStatus(id: string, options?: FlowConnectionOptions): Promise<TransactionStatusType> {
        const web3 = await this.getWeb3(options)
        const { status } = await web3.getTransactionStatus(id)
        switch (status) {
            case TransactionStatusCode.UNKNOWN:
                return TransactionStatusType.NOT_DEPEND
            case TransactionStatusCode.PENDING:
            case TransactionStatusCode.FINALIZED:
            case TransactionStatusCode.EXECUTED:
                return TransactionStatusType.NOT_DEPEND
            case TransactionStatusCode.SEALED:
                return TransactionStatusType.NOT_DEPEND
            case TransactionStatusCode.EXPIRED:
                return TransactionStatusType.FAILED
            default:
                unreachable(status)
        }
    }
    async getTransactionNonce(address: string, options?: FlowConnectionOptions): Promise<number> {
        const web3 = await this.getWeb3(options)
        const account = await web3.getAccount(address)
        const key = first(account.keys)
        return key?.sequenceNumber ?? 0
    }
    switchChain(options?: FlowConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
    async signMessage(dataToSign: string, signType?: string, options?: FlowConnectionOptions) {
        const web3 = await this.getWeb3(options)
        return web3.currentUser.signUserMessage(dataToSign)
    }
    async verifyMessage(
        dataToVerify: string,
        signature: CompositeSignature[],
        signType?: string,
        options?: FlowConnectionOptions,
    ): Promise<boolean> {
        const web3 = await this.getWeb3(options)
        return web3.verifyUserSignatures(dataToVerify, signature)
    }
    async callTransaction(query: QueryOptions, options?: FlowConnectionOptions) {
        const web3 = await this.getWeb3(options)
        return web3.query(query)
    }
    async sendTransaction(mutation: MutateOptions, options?: FlowConnectionOptions): Promise<string> {
        const web3 = await this.getWeb3(options)
        const id = await web3.mutate(mutation)
        await web3.tx(id).onceSealed()
        return id
    }
    signTransaction(mutation: MutateOptions, options?: FlowConnectionOptions): Promise<never> {
        throw new Error('Method not implemented.')
    }
    signTransactions(mutations: MutateOptions[], options?: FlowConnectionOptions): Promise<never> {
        throw new Error('Method not implemented.')
    }
    sendSignedTransaction(signature: never, options?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
}

/**
 * Build connection with provider.
 * @param providerType
 * @returns
 */
export function createConnection(chainId = ChainId.Mainnet, account = '', providerType = ProviderType.Blocto) {
    return new Connection(chainId, account, providerType)
}
