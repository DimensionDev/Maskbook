import { first } from 'lodash-unified'
import { unreachable } from '@dimensiondev/kit'
import { CompositeSignature, TransactionStatusCode, MutateOptions, QueryOptions } from '@blocto/fcl'
import { ChainId, ProviderType } from '@masknet/web3-shared-flow'
import { TransactionStatusType } from '@masknet/plugin-infra/web3'
import { Providers } from './provider'
import type { FlowConnection as BaseConnection, FlowConnectionOptions } from './types'

class Connection implements BaseConnection {
    constructor(private account: string, private chainId: ChainId, private providerType: ProviderType) {}

    getWeb3(options?: FlowConnectionOptions) {
        return Providers[options?.providerType ?? this.providerType].createWeb3(options?.chainId ?? this.chainId)
    }
    async getAccount(options?: FlowConnectionOptions): Promise<string> {
        const web3 = await this.getWeb3(options)
        return web3.currentUser().addr ?? ''
    }
    async getChainId(options?: FlowConnectionOptions): Promise<ChainId> {
        return Promise.resolve(options?.chainId ?? this.chainId)
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
        return await web3.query(query)
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
    watchTransaction(id: string, mutation: MutateOptions, options?: FlowConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
    unwatchTransaction(id: string, options?: FlowConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
    addChain(chainId: ChainId, options?: FlowConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
    switchChain(chainId: ChainId, options?: FlowConnectionOptions): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

/**
 * Build connection with provider.
 * @param providerType
 * @returns
 */
export function createConnection(account = '', chainId = ChainId.Mainnet, providerType = ProviderType.Blocto) {
    return new Connection(account, chainId, providerType)
}
