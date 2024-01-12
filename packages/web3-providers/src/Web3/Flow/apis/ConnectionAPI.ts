import { first } from 'lodash-es'
import { getUnixTime } from 'date-fns'
import { unreachable } from '@masknet/kit'
import {
    AddressType,
    type Operation,
    type SchemaType,
    ChainId,
    type Web3,
    type Transaction,
    type TransactionDetailed,
    type TransactionReceipt,
    type Block,
    isNativeTokenAddress,
    type TransactionQuery,
    type TransactionSignature,
    TransactionStatusCode,
    type BlockHeader,
    type ProviderType,
    type Signature,
} from '@masknet/web3-shared-flow'
import {
    type FungibleToken,
    type NonFungibleToken,
    type NonFungibleTokenMetadata,
    type NonFungibleTokenContract,
    type NonFungibleCollection,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import { toHex, type Account } from '@masknet/shared-base'
import type { BaseConnection } from '../../Base/apis/Connection.js'
import { FlowConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import { FlowChainResolver } from './ResolverAPI.js'
import { FlowWeb3API } from './Web3API.js'
import type { FlowConnectionOptions } from '../types/index.js'
import { flow } from '../../../Manager/registry.js'

export class FlowConnectionAPI
    implements
        BaseConnection<
            ChainId,
            AddressType,
            SchemaType,
            ProviderType,
            Signature,
            Operation,
            Transaction,
            TransactionReceipt,
            TransactionDetailed,
            TransactionSignature,
            Block,
            Web3
        >
{
    constructor(options?: FlowConnectionOptions) {
        this.ConnectionOptions = new FlowConnectionOptionsAPI(options)
        this.Web3 = new FlowWeb3API(options)
    }

    private Web3
    private ConnectionOptions

    getWeb3(initial?: FlowConnectionOptions) {
        return this.Web3.getWeb3(initial)
    }

    async getBalance(address: string, initial?: FlowConnectionOptions): Promise<string> {
        const web3 = this.getWeb3(initial)
        const account = await web3.send([web3.getAccount(address)]).then(web3.decode)
        return account.balance.toFixed()
    }

    getNativeTokenBalance(initial?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getFungibleTokenBalance(address: string, schema?: SchemaType, initial?: FlowConnectionOptions): Promise<string> {
        if (!address || isNativeTokenAddress(address)) return this.getNativeTokenBalance(initial)

        // TODO
        return Promise.resolve('0')
    }

    getNonFungibleTokenBalance(
        address: string,
        tokenId?: string,
        schema?: SchemaType,
        initial?: FlowConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getFungibleTokensBalance(
        listOfAddress: string[],
        initial?: FlowConnectionOptions,
    ): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokensBalance(
        listOfAddress: string[],
        initial?: FlowConnectionOptions,
    ): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }

    getGasPrice(initial?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getCode(address: string, initial?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getAddressType() {
        return Promise.resolve(AddressType.Default)
    }

    getSchemaType(address: string, initial?: FlowConnectionOptions): Promise<SchemaType> {
        throw new Error('Method not implemented.')
    }

    async getAccount(initial?: FlowConnectionOptions): Promise<string> {
        const web3 = this.getWeb3(initial)
        return web3.currentUser().addr ?? ''
    }

    async getChainId(initial?: FlowConnectionOptions): Promise<ChainId> {
        const options = this.ConnectionOptions.fill(initial)
        return options.chainId
    }

    getBlock(no: number, initial?: FlowConnectionOptions): Promise<Block | null> {
        const web3 = this.getWeb3(initial)
        return web3.send([web3.getBlock(), web3.atBlockHeight(no as number)]).then(web3.decode)
    }

    async getBlockNumber(initial?: FlowConnectionOptions): Promise<number> {
        const web3 = this.getWeb3(initial)
        const blockHeader = await web3.send([web3.getBlockHeader()]).then(web3.decode)
        return blockHeader.height
    }

    async getBlockTimestamp(initial?: FlowConnectionOptions): Promise<number> {
        const web3 = this.getWeb3(initial)
        const blockHeader: BlockHeader = await web3.send([web3.getBlockHeader()]).then(web3.decode)
        return getUnixTime(new Date(blockHeader.timestamp as unknown as string))
    }

    async getTransaction(id: string, initial?: FlowConnectionOptions | undefined): Promise<TransactionDetailed | null> {
        const web3 = this.getWeb3(initial)
        return web3.getTransaction(id)
    }

    async getTransactionReceipt(id: string, initial?: FlowConnectionOptions): Promise<TransactionReceipt | null> {
        return null
    }

    async getTransactionStatus(id: string, initial?: FlowConnectionOptions): Promise<TransactionStatusType> {
        const web3 = this.getWeb3(initial)
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

    async getTransactionNonce(address: string, initial?: FlowConnectionOptions): Promise<number> {
        const web3 = this.getWeb3(initial)
        const account = web3.getAccount(address)
        const key = first(account.keys)
        return key?.sequenceNumber ?? 0
    }

    getNativeToken(initial?: FlowConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.ConnectionOptions.fill(initial)
        const token = FlowChainResolver.nativeCurrency(options.chainId)
        return Promise.resolve(token)
    }

    getFungibleToken(address: string, initial?: FlowConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        if (!address || isNativeTokenAddress(address)) return this.getNativeToken(initial)
        throw new Error('Method not implemented.')
    }

    getNonFungibleToken(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: FlowConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenOwner(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: FlowConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenOwnership(
        address: string,
        tokenId: string,
        owner: string,
        schema?: SchemaType | undefined,
        initial?: FlowConnectionOptions,
    ): Promise<boolean> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenMetadata(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: FlowConnectionOptions,
    ): Promise<NonFungibleTokenMetadata<ChainId>> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenContract(
        address: string,
        schema?: SchemaType,
        initial?: FlowConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenCollection(
        address: string,
        schema?: SchemaType,
        initial?: FlowConnectionOptions,
    ): Promise<NonFungibleCollection<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }

    approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: FlowConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    approveAllNonFungibleTokens(
        address: string,
        recipient: string,
        approved: boolean,
        schema?: SchemaType,
        initial?: FlowConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: FlowConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    transferNonFungibleToken(
        address: string,
        tokenId: string,
        recipient: string,
        amount: string,
        schema?: SchemaType,
        initial?: FlowConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async connect(initial?: FlowConnectionOptions): Promise<Account<ChainId>> {
        const options = this.ConnectionOptions.fill(initial)
        return {
            account: '',
            chainId: ChainId.Mainnet,
            ...(await flow.state?.Provider?.connect(options.providerType, options.chainId)),
        }
    }

    async disconnect(initial?: FlowConnectionOptions): Promise<void> {
        const options = this.ConnectionOptions.fill(initial)
        await flow.state?.Provider?.disconnect(options.providerType)
    }

    async signMessage(type: string, message: string, initial?: FlowConnectionOptions) {
        const web3 = this.getWeb3(initial)
        const data = new TextEncoder().encode(message)
        const signed = first(await web3.currentUser.signUserMessage(toHex(data)))
        if (!signed) throw new Error('Failed to sign message.')
        return signed.signature
    }

    createAccount(initial?: FlowConnectionOptions): Account<ChainId> {
        throw new Error('Method not implemented.')
    }

    async switchChain(chainId: ChainId, initial?: FlowConnectionOptions): Promise<void> {
        await this.Web3.getProviderInstance(initial).switchChain(chainId)
    }

    async callTransaction(query: TransactionQuery, initial?: FlowConnectionOptions): Promise<string> {
        const web3 = this.getWeb3(initial)
        return web3.query(query)
    }

    async sendTransaction(mutation: Transaction, initial?: FlowConnectionOptions): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        const web3 = this.getWeb3(options)
        const id = await this.getWeb3(options).mutate(mutation)
        await web3.tx(id).onceSealed()
        return id
    }

    confirmTransaction(hash: string, initial?: FlowConnectionOptions): Promise<TransactionReceipt> {
        throw new Error('Method not implemented.')
    }

    estimateTransaction(
        transaction: Transaction,
        fallback?: number | undefined,
        initial?: FlowConnectionOptions | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    signTransaction(mutation: Transaction, initial?: FlowConnectionOptions): Promise<never> {
        throw new Error('Method not implemented.')
    }

    signTransactions(mutations: Transaction[], initial?: FlowConnectionOptions): Promise<never> {
        throw new Error('Method not implemented.')
    }

    sendSignedTransaction(signature: never, initial?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    replaceTransaction(hash: string, config: Transaction, initial?: FlowConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    cancelTransaction(hash: string, config: Transaction, initial?: FlowConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
