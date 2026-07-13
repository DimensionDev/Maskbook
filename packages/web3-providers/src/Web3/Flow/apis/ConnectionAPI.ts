import { first } from 'lodash-es'
import { unreachable } from '@masknet/kit'
import {
    AddressType,
    type SchemaType,
    ChainId,
    type Transaction,
    type TransactionDetailed,
    type TransactionReceipt,
    isNativeTokenAddress,
    type TransactionSignature,
    TransactionStatusCode,
    type ProviderType,
    type Signature,
} from '@masknet/web3-shared-flow'
import { type FungibleToken, TransactionStatusType } from '@masknet/web3-shared-base'
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
            Transaction,
            TransactionReceipt,
            TransactionDetailed,
            TransactionSignature
        >
{
    constructor(options?: FlowConnectionOptions) {
        this.ConnectionOptions = new FlowConnectionOptionsAPI(options)
        this.Web3 = new FlowWeb3API(options)
    }

    private Web3
    private ConnectionOptions

    private getWeb3(initial?: FlowConnectionOptions) {
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

    getFungibleTokensBalance(
        listOfAddress: string[],
        initial?: FlowConnectionOptions,
    ): Promise<Record<string, string>> {
        throw new Error('Method not implemented.')
    }

    getGasPrice(initial?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }

    getAddressType() {
        return Promise.resolve(AddressType.Default)
    }

    async getAccount(initial?: FlowConnectionOptions): Promise<string> {
        const web3 = this.getWeb3(initial)
        return web3.currentUser().addr ?? ''
    }

    async getChainId(initial?: FlowConnectionOptions): Promise<ChainId> {
        const options = this.ConnectionOptions.fill(initial)
        return options.chainId
    }

    async getBlockNumber(initial?: FlowConnectionOptions): Promise<number> {
        const web3 = this.getWeb3(initial)
        const blockHeader = await web3.send([web3.getBlockHeader()]).then(web3.decode)
        return blockHeader.height
    }

    async getTransaction(id: string, initial?: FlowConnectionOptions  ): Promise<TransactionDetailed | null> {
        const web3 = this.getWeb3(initial)
        return web3.getTransaction(id)
    }

    async getTransactionReceipt(id: string, initial?: FlowConnectionOptions): Promise<null> {
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

    getNativeToken(initial?: FlowConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.ConnectionOptions.fill(initial)
        const token = FlowChainResolver.nativeCurrency(options.chainId)
        return Promise.resolve(token)
    }

    getFungibleToken(address: string, initial?: FlowConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        if (!address || isNativeTokenAddress(address)) return this.getNativeToken(initial)
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

    async switchChain(chainId: ChainId, initial?: FlowConnectionOptions): Promise<void> {
        await this.Web3.getProviderInstance(initial).switchChain(chainId)
    }
    async sendTransaction(mutation: Transaction, initial?: FlowConnectionOptions): Promise<string> {
        const options = this.ConnectionOptions.fill(initial)
        const web3 = this.getWeb3(options)
        const id = await this.getWeb3(options).mutate(mutation)
        await web3.tx(id).onceSealed()
        return id
    }

    signTransaction(mutation: Transaction, initial?: FlowConnectionOptions): Promise<never> {
        throw new Error('Method not implemented.')
    }

    signTransactions(mutations: Transaction[], initial?: FlowConnectionOptions): Promise<never> {
        throw new Error('Method not implemented.')
    }
}
