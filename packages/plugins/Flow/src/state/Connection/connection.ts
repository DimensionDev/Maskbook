import getUnixTime from 'date-fns/getUnixTime'
import { first } from 'lodash-unified'
import { unreachable } from '@dimensiondev/kit'
import type { BlockHeaderObject, BlockObject, MutateOptions, QueryOptions } from '@blocto/fcl'
import {
    ChainId,
    createNativeToken,
    getTokenConstants,
    ProviderType,
    SchemaType,
    TransactionStatusCode,
} from '@masknet/web3-shared-flow'
import {
    Account,
    FungibleToken,
    isSameAddress,
    NonFungibleToken,
    NonFungibleTokenCollection,
    NonFungibleTokenContract,
    NonFungibleTokenMetadata,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import { PartialRequired, toHex } from '@masknet/shared-base'
import { Providers } from './provider'
import type { FlowWeb3Connection as BaseConnection, FlowConnectionOptions } from './types'
import { Web3StateSettings } from '../../settings'
import type { Plugin } from '@masknet/plugin-infra'

function isNativeTokenAddress(chainId: ChainId, address: string) {
    const { FLOW_ADDRESS } = getTokenConstants(chainId)
    return isSameAddress(address, FLOW_ADDRESS)
}

class Connection implements BaseConnection {
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
            ...initial,
            ...overrides,
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
            ...(await Web3StateSettings.value.Provider?.connect(options.chainId, options.providerType)),
        }
    }
    async disconnect(initial?: FlowConnectionOptions): Promise<void> {
        const options = this.getOptions(initial)
        await Web3StateSettings.value.Provider?.disconnect(options.providerType)
    }
    getGasPrice(initial?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getSchemaType(address: string, initial?: FlowConnectionOptions): Promise<SchemaType> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenContract(
        address: string,
        schemaType?: SchemaType,
        initial?: FlowConnectionOptions,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenCollection(
        address: string,
        schemaType?: SchemaType,
        initial?: FlowConnectionOptions,
    ): Promise<NonFungibleTokenCollection<ChainId>> {
        throw new Error('Method not implemented.')
    }
    async getBlock(no: number, initial?: FlowConnectionOptions): Promise<BlockObject | null> {
        const options = this.getOptions(initial)
        const web3 = await this.getWeb3(options)
        return web3.send([web3.getBlock(), web3.atBlockHeight(no)]).then(web3.decode)
    }
    async getBlockTimestamp(initial?: FlowConnectionOptions): Promise<number> {
        const options = this.getOptions(initial)
        const web3 = await this.getWeb3(options)
        const blockHeader: BlockHeaderObject = await web3.send([web3.getBlockHeader()]).then(web3.decode)
        return getUnixTime(new Date(blockHeader.timestamp as unknown as string))
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
        recipient: string,
        tokenId: string,
        amount: string,
        schemaType?: SchemaType,
        initial?: FlowConnectionOptions,
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getNativeToken(initial?: FlowConnectionOptions): Promise<FungibleToken<ChainId, SchemaType>> {
        const options = this.getOptions(initial)
        const token = createNativeToken(options.chainId)
        return Promise.resolve(token)
    }
    getNativeTokenBalance(initial?: FlowConnectionOptions): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getFungibleTokenBalance(address: string, initial?: FlowConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        if (!address || isNativeTokenAddress(options.chainId, address)) {
            return this.getNativeTokenBalance(options)
        }
        // TODO
        return Promise.resolve('0')
    }
    getNonFungibleTokenBalance(
        address: string,
        tokenId?: string,
        schemaType?: SchemaType,
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
        if (!address || isNativeTokenAddress(options.chainId, address)) {
            return this.getNativeToken(options)
        }
        throw new Error('Method not implemented.')
    }
    getNonFungibleToken(
        address: string,
        tokenId: string,
        schemaType?: SchemaType,
        initial?: FlowConnectionOptions,
    ): Promise<NonFungibleToken<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenOwnership(
        address: string,
        owner: string,
        tokenId: string,
        schema?: SchemaType | undefined,
        initial?: FlowConnectionOptions,
    ): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    getNonFungibleTokenMetadata(
        address: string,
        tokenId: string,
        schemaType?: SchemaType,
        initial?: FlowConnectionOptions,
    ): Promise<NonFungibleTokenMetadata<ChainId>> {
        throw new Error('Method not implemented.')
    }

    async getAccount(initial?: FlowConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        const web3 = await this.getWeb3(options)
        return web3.currentUser().addr ?? ''
    }
    async getChainId(initial?: FlowConnectionOptions): Promise<ChainId> {
        const options = this.getOptions(initial)
        return options.chainId
    }
    async getBlockNumber(initial?: FlowConnectionOptions): Promise<number> {
        const options = this.getOptions(initial)
        const web3 = await this.getWeb3(options)
        const blockHeader = await web3.send([web3.getBlockHeader()]).then(web3.decode)
        return blockHeader.height
    }
    async getBalance(address: string, initial?: FlowConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        const web3 = await this.getWeb3(options)
        const account = await web3.send([web3.getAccount(address)]).then(web3.decode)
        return account.balance.toFixed()
    }
    async getTransaction(id: string, initial?: FlowConnectionOptions) {
        const options = this.getOptions(initial)
        const web3 = await this.getWeb3(options)
        return web3.getTransaction(id)
    }
    async getTransactionReceipt(id: string, initial?: FlowConnectionOptions) {
        return null
    }
    async getTransactionStatus(id: string, initial?: FlowConnectionOptions): Promise<TransactionStatusType> {
        const options = this.getOptions(initial)
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
    async getTransactionNonce(address: string, initial?: FlowConnectionOptions): Promise<number> {
        const options = this.getOptions(initial)
        const web3 = await this.getWeb3(options)
        const account = web3.getAccount(address)
        const key = first(account.keys)
        return key?.sequenceNumber ?? 0
    }
    async switchChain(initial?: FlowConnectionOptions): Promise<void> {
        const options = this.getOptions(initial)
        await Providers[options.providerType].switchChain(options.chainId)
    }
    async signMessage(dataToSign: string, signType?: string, initial?: FlowConnectionOptions) {
        const options = this.getOptions(initial)
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
        initial?: FlowConnectionOptions,
    ): Promise<boolean> {
        const options = this.getOptions(initial)
        const web3 = await this.getWeb3(options)
        if (!options.account) throw new Error('No account found.')
        return web3.verifyUserSignatures(dataToVerify, [
            {
                addr: options.account,
                keyId: 1,
                signature,
            },
        ])
    }
    async callTransaction(query: QueryOptions, initial?: FlowConnectionOptions) {
        const options = this.getOptions(initial)
        const web3 = await this.getWeb3(options)
        return web3.query(query)
    }
    async sendTransaction(mutation: MutateOptions, initial?: FlowConnectionOptions): Promise<string> {
        const options = this.getOptions(initial)
        const web3 = await this.getWeb3(options)
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
    replaceRequest(hash: string, config: MutateOptions, initial?: FlowConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
    cancelRequest(hash: string, config: MutateOptions, initial?: FlowConnectionOptions): Promise<void> {
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
