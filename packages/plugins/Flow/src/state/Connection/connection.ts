import { first, identity, pickBy } from 'lodash-es'
import type { BlockObject, MutateOptions, QueryOptions } from '@blocto/fcl'
import { AddressType, ChainId, ProviderType, type SchemaType, type TransactionReceipt } from '@masknet/web3-shared-flow'
import type {
    Account,
    FungibleToken,
    NonFungibleToken,
    NonFungibleCollection,
    NonFungibleTokenContract,
    NonFungibleTokenMetadata,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import type { Plugin } from '@masknet/plugin-infra'
import { type PartialRequired, toHex } from '@masknet/shared-base'
import { FlowWeb3 } from '@masknet/web3-providers'
import { Providers } from '../Provider/provider.js'
import type { FlowConnection, FlowConnectionOptions } from './types.js'
import { Web3StateSettings } from '../../settings/index.js'

class Connection implements FlowConnection {
    constructor(
        private chainId: ChainId,
        private account: string,
        private providerType: ProviderType,
        private context?: Plugin.Shared.SharedContext,
    ) {}

    private getOptions(
        initial?: FlowConnectionOptions,
        overrides?: Partial<FlowConnectionOptions>,
    ): PartialRequired<FlowConnectionOptions, 'account' | 'chainId' | 'providerType'> {
        return {
            account: this.account,
            chainId: this.chainId,
            providerType: this.providerType,
            ...pickBy(initial, identity),
            ...pickBy(overrides, identity),
        }
    }

    private _getWeb3Provider(initial?: FlowConnectionOptions) {
        const options = this.getOptions(initial)
        return Providers[options.providerType]
    }

    getWeb3(initial?: FlowConnectionOptions) {
        const options = this.getOptions(initial)
        return this._getWeb3Provider(options).createWeb3(options)
    }
    getWeb3Provider(initial?: FlowConnectionOptions) {
        const options = this.getOptions(initial)
        return this._getWeb3Provider(options).createWeb3Provider(options)
    }
    async connect(initial?: FlowConnectionOptions): Promise<Account<ChainId>> {
        const options = this.getOptions(initial)
        return {
            account: '',
            chainId: ChainId.Mainnet,
            ...(await Web3StateSettings.value.Provider?.connect(options.providerType, options.chainId)),
        }
    }
    async disconnect(initial?: FlowConnectionOptions): Promise<void> {
        const options = this.getOptions(initial)
        await Web3StateSettings.value.Provider?.disconnect(options.providerType)
    }
    getGasPrice(initial?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getAddressType() {
        return Promise.resolve(AddressType.Default)
    }
    getSchemaType(address: string, initial?: FlowConnectionOptions): Promise<SchemaType> {
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
    async getBlock(no: number, initial?: FlowConnectionOptions): Promise<BlockObject | null> {
        const options = this.getOptions(initial)
        return FlowWeb3.getBlock(options.chainId, no)
    }
    async getBlockTimestamp(initial?: FlowConnectionOptions): Promise<number> {
        const options = this.getOptions(initial)
        return FlowWeb3.getBlockTimestamp(options.chainId)
    }
    approveFungibleToken(
        address: string,
        recipient: string,
        amount: string,
        initial?: FlowConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    approveNonFungibleToken(
        address: string,
        recipient: string,
        tokenId: string,
        schema?: SchemaType,
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
    getNativeToken(initial?: FlowConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        return FlowWeb3.getNativeToken(options.chainId)
    }
    getNativeTokenBalance(initial?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getFungibleTokenBalance(address: string, schema?: SchemaType, initial?: FlowConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        return FlowWeb3.getFungibleTokenBalance(options.chainId, address, options.account, schema)
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
    getCode(address: string, initial?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getFungibleToken(address: string, initial?: FlowConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        return FlowWeb3.getFungibleToken(options.chainId, address)
    }
    async getNonFungibleToken(
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

    async getAccount(initial?: FlowConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        const web3 = this.getWeb3(options)
        return web3.currentUser().addr ?? ''
    }
    async getChainId(initial?: FlowConnectionOptions): Promise<ChainId> {
        const options = this.getOptions(initial)
        return options.chainId
    }
    async getBlockNumber(initial?: FlowConnectionOptions): Promise<number> {
        const options = this.getOptions(initial)
        return FlowWeb3.getBlockNumber(options.chainId)
    }
    async getBalance(address: string, initial?: FlowConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        return FlowWeb3.getBalance(options.chainId, address)
    }
    async getTransaction(id: string, initial?: FlowConnectionOptions) {
        const options = this.getOptions(initial)
        return FlowWeb3.getTransaction(options.chainId, id)
    }
    async getTransactionReceipt(id: string, initial?: FlowConnectionOptions): Promise<TransactionReceipt | null> {
        const options = this.getOptions(initial)
        return FlowWeb3.getTransactionReceipt(options.chainId, id)
    }
    async getTransactionStatus(id: string, initial?: FlowConnectionOptions): Promise<TransactionStatusType> {
        const options = this.getOptions(initial)
        return FlowWeb3.getTransactionStatus(options.chainId, id)
    }
    async getTransactionNonce(address: string, initial?: FlowConnectionOptions): Promise<number> {
        const options = this.getOptions(initial)
        return FlowWeb3.getTransactionNonce(options.chainId, address)
    }
    async switchChain(chainId: ChainId, initial?: FlowConnectionOptions): Promise<void> {
        const options = this.getOptions(initial)
        await Providers[options.providerType].switchChain(chainId)
    }
    async signMessage(type: string, message: string, initial?: FlowConnectionOptions) {
        const options = this.getOptions(initial)
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
        initial?: FlowConnectionOptions,
    ): Promise<boolean> {
        const options = this.getOptions(initial)
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
    async callTransaction(query: QueryOptions, initial?: FlowConnectionOptions) {
        const options = this.getOptions(initial)
        return FlowWeb3.callTransaction(options.chainId, query)
    }
    async sendTransaction(mutation: MutateOptions, initial?: FlowConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        const web3 = this.getWeb3(options)
        const id = await web3.mutate(mutation)
        await web3.tx(id).onceSealed()
        return id
    }
    signTransaction(mutation: MutateOptions, initial?: FlowConnectionOptions): Promise<never> {
        throw new Error('Method not implemented.')
    }
    signTransactions(mutations: MutateOptions[], initial?: FlowConnectionOptions): Promise<never> {
        throw new Error('Method not implemented.')
    }
    sendSignedTransaction(signature: never, initial?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    confirmTransaction(hash: string, initial?: FlowConnectionOptions): Promise<TransactionReceipt> {
        throw new Error('Method not implemented.')
    }
    replaceTransaction(hash: string, config: MutateOptions, initial?: FlowConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
    cancelTransaction(hash: string, config: MutateOptions, initial?: FlowConnectionOptions): Promise<void> {
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
