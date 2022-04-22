import type Web3 from 'web3'
import type { RequestArguments, Transaction, TransactionReceipt } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type {
    ChainId,
    NetworkType,
    ProviderType,
    EIP1193Provider,
    EthereumMethodType,
    EthereumTransactionConfig,
    EthereumTokenType,
} from '@masknet/web3-shared-evm'

export type EVM_Web3 = Web3

export type EVM_Web3State = Web3Plugin.ObjectCapabilities.Capabilities<
    ChainId,
    ProviderType,
    NetworkType,
    string,
    EthereumTransactionConfig,
    Transaction,
    string,
    EVM_Web3
>

export interface EVM_Provider extends Web3Plugin.Provider<ChainId, EIP1193Provider, EVM_Web3> {
    /** The basic RPC request method. */
    request<T extends unknown>(requestArguments: RequestArguments): Promise<T>
}

export type EVM_ConnectionOptions = Web3Plugin.ConnectionOptions<ChainId, ProviderType, EthereumTransactionConfig> & {
    popupsWindow?: boolean
}

export interface EVM_Connection
    extends Web3Plugin.Connection<
        ChainId,
        ProviderType,
        string,
        EthereumTransactionConfig,
        Transaction,
        string,
        EVM_Web3
    > {
    getERC20Token(
        address: string,
        options?: EVM_ConnectionOptions,
    ): Promise<Web3Plugin.FungibleToken<EthereumTokenType.ERC20>>
    getNativeToken(
        address: string,
        options?: EVM_ConnectionOptions,
    ): Promise<Web3Plugin.FungibleToken<EthereumTokenType.Native>>
    getERC721Token(
        address: string,
        tokenId: string,
        options?: EVM_ConnectionOptions,
    ): Promise<Web3Plugin.NonFungibleToken<EthereumTokenType.ERC721>>
    getERC1155Token(
        address: string,
        tokenId: string,
        options?: EVM_ConnectionOptions,
    ): Promise<Web3Plugin.NonFungibleToken<EthereumTokenType.ERC1155>>
    getCode(address: string, options?: EVM_ConnectionOptions): Promise<string>
    getTransactionReceiptHijacked(hash: string, options?: EVM_ConnectionOptions): Promise<TransactionReceipt | null>
    getTransactionReceipt(hash: string, options?: EVM_ConnectionOptions): Promise<TransactionReceipt | null>
    confirmRequest(options?: EVM_ConnectionOptions): Promise<void>
    rejectRequest(options?: EVM_ConnectionOptions): Promise<void>
    replaceRequest(hash: string, config: EthereumTransactionConfig, options?: EVM_ConnectionOptions): Promise<void>
    cancelRequest(hash: string, config: EthereumTransactionConfig, options?: EVM_ConnectionOptions): Promise<void>
}

export interface Context {
    readonly account: string
    readonly chainId: ChainId
    readonly requestId: number
    readonly writeable: boolean
    readonly providerType: ProviderType
    readonly method: EthereumMethodType
    readonly connection: EVM_Connection
    readonly requestOptions: EVM_ConnectionOptions | undefined

    /**
     * JSON RPC request payload
     */
    readonly request: JsonRpcPayload

    /**
     * JSON RPC response object
     */
    readonly response: JsonRpcResponse | undefined

    config: EthereumTransactionConfig | undefined
    requestArguments: RequestArguments
    result: unknown
    error: Error | null

    /**
     * Resolve a request and write down the result into the context. Alias of end(null, result)
     */
    write: (result: unknown) => void

    /**
     * Reject a request and throw an error. Alias of end(error)
     */
    abort: (error: unknown, fallback?: string) => void

    /**
     * Seal a request by resolving or rejecting it.
     */
    end: (error?: Error | null, result?: unknown) => void
}

export interface Middleware<T> {
    fn: (context: T, next: () => Promise<void>) => Promise<void>
}

export interface Translator {
    encode?(context: Context): void
    decode?(context: Context): void
}
