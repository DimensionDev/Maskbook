import { first } from 'lodash-es'
import getUnixTime from 'date-fns/getUnixTime'
import { unreachable } from '@masknet/kit'
import {
    AddressType,
    type Operation,
    type SchemaType,
    ChainId,
    type Web3,
    type Web3Provider,
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
import type { ConnectionAPI_Base } from '../../Base/apis/ConnectionAPI.js'
import { FlowConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import { FlowChainResolverAPI } from './ResolverAPI.js'
import { FlowWeb3API } from './Web3API.js'
import { FlowWeb3StateRef } from './Web3StateAPI.js'
import type { ConnectionOptions } from '../types/index.js'

export class FlowConnectionAPI
    implements
        ConnectionAPI_Base<
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
            Web3,
            Web3Provider
        >
{
    constructor(private options?: ConnectionOptions) {}

    private Web3 = new FlowWeb3API(this.options)
    private ConnectionOptions = new FlowConnectionOptionsAPI(this.options)

    getWeb3(initial?: ConnectionOptions) {
        return this.Web3.getWeb3(initial)
    }

    getWeb3Provider(initial?: ConnectionOptions) {
        return this.Web3.getWeb3Provider(initial)
    }

    async getBalance(address: string, initial?: ConnectionOptions): Promise<string> {
        const web3 = this.getWeb3(initial)
        const account = await web3.send([web3.getAccount(address)]).then(web3.decode)
        return account.balance.toFixed()
    }

    getNativeTokenBalance(initial?: ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getFungibleTokenBalance(address: string, schema?: SchemaType, initial?: ConnectionOptions): Promise<string> {
        if (!address || isNativeTokenAddress(address)) return this.getNativeTokenBalance(initial)

        // TODO
        return Promise.resolve('0')
    }

    getNonFungibleTokenBalance(
        address: string,
        tokenId?: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getFungibleTokensBalance(listOfAddress: string[], initial?: ConnectionOptions): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokensBalance(listOfAddress: string[], initial?: ConnectionOptions): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }

    getGasPrice(initial?: ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getCode(address: string, initial?: ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getAddressType() {
        return Promise.resolve(AddressType.Default)
    }

    getSchemaType(address: string, initial?: ConnectionOptions): Promise<SchemaType> {
        throw new Error('Method not implemented.')
    }

    async getAccount(initial?: ConnectionOptions): Promise<string> {
        const web3 = this.getWeb3(initial)
        return web3.currentUser().addr ?? ''
    }

    async getChainId(initial?: ConnectionOptions): Promise<ChainId> {
        const options = this.ConnectionOptions.fill(initial)
        return options.chainId
    }

    getBlock(no: number, initial?: ConnectionOptions): Promise<Block | null> {
        const web3 = this.getWeb3(initial)
        return web3.send([web3.getBlock(), web3.atBlockHeight(no as number)]).then(web3.decode)
    }

    async getBlockNumber(initial?: ConnectionOptions): Promise<number> {
        const web3 = this.getWeb3(initial)
        const blockHeader = await web3.send([web3.getBlockHeader()]).then(web3.decode)
        return blockHeader.height
    }

    async getBlockTimestamp(initial?: ConnectionOptions): Promise<number> {
        const web3 = this.getWeb3(initial)
        const blockHeader: BlockHeader = await web3.send([web3.getBlockHeader()]).then(web3.decode)
        return getUnixTime(new Date(blockHeader.timestamp as unknown as string))
    }

    async getTransaction(id: string, initial?: ConnectionOptions | undefined): Promise<TransactionDetailed | null> {
        const web3 = this.getWeb3(initial)
        return web3.getTransaction(id)
    }

    async getTransactionReceipt(id: string, initial?: ConnectionOptions): Promise<TransactionReceipt | null> {
        return null
    }

    async getTransactionStatus(id: string, initial?: ConnectionOptions): Promise<TransactionStatusType> {
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

    async getTransactionNonce(address: string, initial?: ConnectionOptions): Promise<number> {
        const web3 = this.getWeb3(initial)
        const account = web3.getAccount(address)
        const key = first(account.keys)
        return key?.sequenceNumber ?? 0
    }

    getNativeToken(initial?: ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.ConnectionOptions.fill(initial)
        const token = new FlowChainResolverAPI().nativeCurrency(options.chainId)
        return Promise.resolve(token)
    }

    getFungibleToken(address: string, initial?: ConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        if (!address || isNativeTokenAddress(address)) return this.getNativeToken(initial)
        throw new Error('Method not implemented.')
    }

    getNonFungibleToken(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenOwner(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenOwnership(
        address: string,
        tokenId: string,
        owner: string,
        schema?: SchemaType | undefined,
        initial?: ConnectionOptions,
    ): Promise<boolean> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenMetadata(
        address: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<NonFungibleTokenMetadata<ChainId>> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenContract(
        address: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }

    getNonFungibleTokenCollection(
        address: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<NonFungibleCollection<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }

    approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    approveNonFungibleToken(
        address: string,
        recipient: string,
        tokenId: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    approveAllNonFungibleTokens(
        address: string,
        recipient: string,
        approved: boolean,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    transferFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        memo?: string,
        initial?: ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    transferNonFungibleToken(
        address: string,
        tokenId: string,
        recipient: string,
        amount: string,
        schema?: SchemaType,
        initial?: ConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    async connect(initial?: ConnectionOptions): Promise<Account<ChainId>> {
        const options = this.ConnectionOptions.fill(initial)
        return {
            account: '',
            chainId: ChainId.Mainnet,
            ...(await FlowWeb3StateRef.value.Provider?.connect(options.providerType, options.chainId)),
        }
    }

    async disconnect(initial?: ConnectionOptions): Promise<void> {
        const options = this.ConnectionOptions.fill(initial)
        await FlowWeb3StateRef.value.Provider?.disconnect(options.providerType)
    }

    async signMessage(type: string, message: string, initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        const web3 = this.getWeb3(options)
        const data = new TextEncoder().encode(message)
        const signed = first(await web3.currentUser.signUserMessage(toHex(data)))
        if (!signed) throw new Error('Failed to sign message.')
        return signed.signature
    }

    async verifyMessage(
        type: string,
        message: string,
        signature: string,
        initial?: ConnectionOptions,
    ): Promise<boolean> {
        const options = this.ConnectionOptions.fill(initial)
        const web3 = this.getWeb3(options)
        if (!options.account) throw new Error('No account found.')
        return web3.verifyUserSignatures(message, [
            {
                addr: options.account,
                keyId: 1,
                signature,
            },
        ])
    }

    createAccount(initial?: ConnectionOptions): Account<ChainId> {
        throw new Error('Method not implemented.')
    }

    async switchChain(chainId: ChainId, initial?: ConnectionOptions): Promise<void> {
        await this.Web3.getProviderInstance(initial).switchChain(chainId)
    }

    async callTransaction(query: TransactionQuery, initial?: ConnectionOptions): Promise<string> {
        const web3 = this.getWeb3(initial)
        return web3.query(query)
    }

    async sendTransaction(mutation: Transaction, initial?: ConnectionOptions): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        const web3 = this.getWeb3(options)
        const id = await this.getWeb3(options).mutate(mutation)
        await web3.tx(id).onceSealed()
        return id
    }

    confirmTransaction(hash: string, initial?: ConnectionOptions): Promise<TransactionReceipt> {
        throw new Error('Method not implemented.')
    }

    estimateTransaction(
        transaction: Transaction,
        fallback?: number | undefined,
        initial?: ConnectionOptions | undefined,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }

    signTransaction(mutation: Transaction, initial?: ConnectionOptions): Promise<never> {
        throw new Error('Method not implemented.')
    }

    signTransactions(mutations: Transaction[], initial?: ConnectionOptions): Promise<never> {
        throw new Error('Method not implemented.')
    }

    sendSignedTransaction(signature: never, initial?: ConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    replaceTransaction(hash: string, config: Transaction, initial?: ConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }

    cancelTransaction(hash: string, config: Transaction, initial?: ConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
