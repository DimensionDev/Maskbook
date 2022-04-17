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
} from '@masknet/web3-shared-evm'

export type Web3State = Web3Plugin.ObjectCapabilities.Capabilities<
    ChainId,
    ProviderType,
    NetworkType,
    string,
    EthereumTransactionConfig,
    Transaction,
    string,
    Web3
>

export type RequestOptions = Web3Plugin.ConnectionOptions<ChainId, ProviderType, EthereumTransactionConfig> & {
    popupsWindow?: boolean
}

export interface Provider extends Web3Plugin.Provider<ChainId, EIP1193Provider, Web3> {
    /** The basic RPC request method. */
    request<T extends unknown>(requestArguments: RequestArguments): Promise<T>
}

export interface Connection
    extends Web3Plugin.Connection<ChainId, ProviderType, string, EthereumTransactionConfig, Transaction, string, Web3> {
    getCode(address: string, options?: RequestOptions): Promise<string>
    getTransactionReceiptHijacked(hash: string, options?: RequestOptions): Promise<TransactionReceipt | null>
    getTransactionReceipt(hash: string, options?: RequestOptions): Promise<TransactionReceipt | null>
    call(config: EthereumTransactionConfig, options?: RequestOptions): Promise<string>
    confirmRequest(options?: RequestOptions): Promise<void>
    rejectRequest(options?: RequestOptions): Promise<void>
    replaceRequest(hash: string, config: EthereumTransactionConfig, options?: RequestOptions): Promise<void>
    cancelRequest(hash: string, config: EthereumTransactionConfig, options?: RequestOptions): Promise<void>
}

export interface Context {
    readonly account: string
    readonly chainId: ChainId
    readonly requestId: number
    readonly writeable: boolean
    readonly providerType: ProviderType
    readonly method: EthereumMethodType
    readonly connection: Connection
    readonly requestOptions: RequestOptions | undefined

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
