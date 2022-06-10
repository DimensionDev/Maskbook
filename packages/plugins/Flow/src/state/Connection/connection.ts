import getUnixTime from 'date-fns/getUnixTime'
import { first } from 'lodash-unified'
import { unreachable } from '@dimensiondev/kit'
import type { BlockHeaderObject, BlockObject, MutateOptions, QueryOptions } from '@blocto/fcl'
import { ChainId, ProviderType, SchemaType, TransactionStatusCode } from '@masknet/web3-shared-flow'
import {
    Account,
    FungibleToken,
    NonFungibleToken,
    NonFungibleTokenCollection,
    NonFungibleTokenContract,
    NonFungibleTokenMetadata,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import { toHex } from '@masknet/shared-base'
import { Providers } from './provider'
import type { FlowWeb3Connection as BaseConnection, FlowConnectionOptions } from './types'
import { Web3StateSettings } from '../../settings'
import type { Plugin } from '@masknet/plugin-infra'

class Connection implements BaseConnection {
    constructor(
        private chainId: ChainId,
        private account: string,
        private providerType: ProviderType,
        private context?: Plugin.Shared.SharedContext,
    ) {}

    private _getWeb3Provider(options?: FlowConnectionOptions) {
        return Providers[options?.providerType ?? this.providerType]
    }

    getWeb3(options?: FlowConnectionOptions) {
        return this._getWeb3Provider(options).createWeb3({
            account: options?.account ?? this.account,
            chainId: options?.chainId ?? this.chainId,
        })
    }
    getWeb3Provider(options?: FlowConnectionOptions) {
        return this._getWeb3Provider(options).createWeb3Provider({
            account: options?.account ?? this.account,
            chainId: options?.chainId ?? this.chainId,
        })
    }
    async connect(options?: FlowConnectionOptions): Promise<Account<ChainId>> {
        return {
            account: '',
            chainId: ChainId.Mainnet,
            ...(await Web3StateSettings.value.Provider?.connect(
                options?.chainId ?? this.chainId,
                options?.providerType ?? this.providerType,
            )),
        }
    }
    async disconnect(options?: FlowConnectionOptions): Promise<void> {
        await Web3StateSettings.value.Provider?.disconnect(options?.providerType ?? this.providerType)
    }
    getGasPrice(options?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getSchemaType(address: string, options?: FlowConnectionOptions): Promise<SchemaType> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenContract(
        address: string,
        schemaType?: SchemaType,
        options?: FlowConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenCollection(
        address: string,
        schemaType?: SchemaType,
        options?: FlowConnectionOptions,
    ): Promise<NonFungibleTokenCollection<ChainId>> {
        throw new Error('Method not implemented.')
    }
    async getBlock(no: number, options?: FlowConnectionOptions): Promise<BlockObject | null> {
        const web3 = await this.getWeb3(options)
        return web3.send([web3.getBlock(), web3.atBlockHeight(no)]).then(web3.decode)
    }
    async getBlockTimestamp(options?: FlowConnectionOptions): Promise<number> {
        const web3 = await this.getWeb3(options)
        const blockHeader: BlockHeaderObject = await web3.send([web3.getBlockHeader()]).then(web3.decode)
        return getUnixTime(new Date(blockHeader.timestamp as unknown as string))
    }
    transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        options?: FlowConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    transferNonFungibleToken(
        address: string,
        recipient: string,
        tokenId: string,
        amount: string,
        schemaType?: SchemaType,
        options?: FlowConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getNativeToken(options?: FlowConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNativeTokenBalance(options?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getFungibleTokenBalance(address: string, options?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenBalance(
        address: string,
        tokenId?: string,
        schemaType?: SchemaType,
        options?: FlowConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getFungibleTokensBalance(
        listOfAddress: string[],
        options?: FlowConnectionOptions,
    ): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokensBalance(
        listOfAddress: string[],
        options?: FlowConnectionOptions,
    ): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }
    getCode(address: string, options?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getFungibleToken(address: string, options?: FlowConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleToken(
        address: string,
        tokenId: string,
        schemaType?: SchemaType,
        options?: FlowConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenOwnship(
        address: string,
        owner: string,
        tokenId: string,
        schema?: SchemaType | undefined,
        options?: FlowConnectionOptions,
    ): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenMetadata(
        address: string,
        tokenId: string,
        schemaType?: SchemaType,
        options?: FlowConnectionOptions,
    ): Promise<NonFungibleTokenMetadata<ChainId>> {
        throw new Error('Method not implemented.')
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
        const blockHeader = await web3.send([web3.getBlockHeader()]).then(web3.decode)
        return blockHeader.height
    }
    async getBalance(address: string, options?: FlowConnectionOptions): Promise<string> {
        const web3 = await this.getWeb3(options)
        const account = await web3.send([web3.getAccount(address)]).then(web3.decode)
        return account.balance.toFixed()
    }
    async getTransaction(id: string, options?: FlowConnectionOptions) {
        const web3 = await this.getWeb3(options)
        return web3.getTransaction(id)
    }
    async getTransactionReceipt(id: string, options?: FlowConnectionOptions) {
        return null
    }
    async getTransactionStatus(id: string, options?: FlowConnectionOptions): Promise<TransactionStatusType> {
        const web3 = await this.getWeb3(options)
        const { status } = web3.getTransactionStatus(id)
        const status_ = status as TransactionStatusCode
        switch (status_) {
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
                unreachable(status_)
        }
    }
    async getTransactionNonce(address: string, options?: FlowConnectionOptions): Promise<number> {
        const web3 = await this.getWeb3(options)
        const account = web3.getAccount(address)
        const key = first(account.keys)
        return key?.sequenceNumber ?? 0
    }
    async switchChain(options?: FlowConnectionOptions): Promise<void> {
        await Providers[options?.providerType ?? this.providerType].switchChain(options?.chainId)
    }
    async signMessage(dataToSign: string, signType?: string, options?: FlowConnectionOptions) {
        const web3 = await this.getWeb3(options)
        const data = new TextEncoder().encode(dataToSign)
        const signed = first(await web3.currentUser.signUserMessage(toHex(data)))
        if (!signed) throw new Error('Failed to sign message.')
        return signed.signature
    }
    async verifyMessage(
        dataToVerify: string,
        signature: string,
        signType?: string,
        options?: FlowConnectionOptions,
    ): Promise<boolean> {
        const web3 = await this.getWeb3(options)
        if (!options?.account) throw new Error('No account found.')
        return web3.verifyUserSignatures(dataToVerify, [
            {
                addr: options?.account,
                keyId: 1,
                signature,
            },
        ])
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
    replaceRequest(hash: string, config: MutateOptions, options?: FlowConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
    cancelRequest(hash: string, config: MutateOptions, options?: FlowConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

/**
 * Build connection with provider.
 * @param providerType
 * @returns
 */
export function createConnection(
    context: Plugin.Shared.SharedContext,
    options?: {
        chainId?: ChainId
        account?: string
        providerType?: ProviderType
    },
) {
    const { chainId = ChainId.Mainnet, account = '', providerType = ProviderType.Blocto } = options ?? {}

    return new Connection(chainId, account, providerType, context)
}
