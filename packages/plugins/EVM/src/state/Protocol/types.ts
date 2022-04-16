import type Web3 from 'web3'
import type { RequestArguments, Transaction, TransactionConfig, TransactionReceipt } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type {
    ChainId,
    SendOverrides,
    RequestOptions,
    ExternalProvider,
    ProviderType,
    EthereumTransactionConfig,
    EthereumMethodType,
} from '@masknet/web3-shared-evm'
import type { Emitter } from '@servie/events'

export interface ProviderEvents {
    chainId: [string]
    accounts: [string[]]
    connect: [
        {
            chainId: ChainId
            account: string
        },
    ]
    discconect: []
}

export interface Provider {
    emitter: Emitter<ProviderEvents>
    /** Get to know whether the provider is ready */
    readonly isReady: boolean
    /** Keep waiting until the provider is ready */
    untilReady: () => Promise<void>
    /** The basic RPC request method. */
    request<T extends unknown>(requestArguments: RequestArguments): Promise<T>
    /** Create an web3 instance. */
    createWeb3(chainId?: ChainId): Web3
    /** Create an ExternalProvider which can be an EIP-1193 provider. */
    createExternalProvider(chainId?: ChainId): ExternalProvider
    /** Create the connection */
    connect(chainId: ChainId): Promise<{
        chainId: ChainId
        account: string
    }>
    /** Dismiss the connection */
    disconnect(): Promise<void>
}

export interface Connection {
    getWeb3(): Web3
    getAccounts(overrides?: SendOverrides, options?: RequestOptions): Promise<string[]>
    getChainId(overrides?: SendOverrides, options?: RequestOptions): Promise<string>
    getBlockNumber(overrides?: SendOverrides, options?: RequestOptions): Promise<number>
    getBalance(address: string, overrides?: SendOverrides, options?: RequestOptions): Promise<string>
    getCode(address: string, overrides?: SendOverrides, options?: RequestOptions): Promise<string>
    getTransactionByHash(hash: string, overrides?: SendOverrides, options?: RequestOptions): Promise<Transaction>
    getTransactionReceiptHijacked(
        hash: string,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ): Promise<TransactionReceipt | null>
    getTransactionReceipt(
        hash: string,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ): Promise<TransactionReceipt | null>
    getTransactionCount(address: string, overrides?: SendOverrides, options?: RequestOptions): Promise<number>
    call(config: TransactionConfig, overrides?: SendOverrides, options?: RequestOptions): Promise<string>
    personalSign(
        dataToSign: string,
        address: string,
        password?: string,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ): Promise<string>
    typedDataSign(
        address: string,
        dataToSign: string,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ): Promise<string>
    addChain(chainId: ChainId, overrides?: SendOverrides, options?: RequestOptions): Promise<boolean>
    switchChain(chainId: ChainId, overrides?: SendOverrides, options?: RequestOptions): Promise<boolean>
    signTransaction(config: TransactionConfig, overrides?: SendOverrides, options?: RequestOptions): Promise<string>
    sendTransaction(config: TransactionConfig, overrides?: SendOverrides, options?: RequestOptions): Promise<void>
    sendRawTransaction(raw: string, overrides?: SendOverrides, options?: RequestOptions): Promise<string>
    watchTransaction(
        hash: string,
        config: TransactionConfig,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ): Promise<void>
    unwatchTransaction(hash: string, overrides?: SendOverrides, options?: RequestOptions): Promise<void>
    confirmRequest(overrides?: SendOverrides, options?: RequestOptions): Promise<void>
    rejectRequest(overrides?: SendOverrides, options?: RequestOptions): Promise<void>
    replaceRequest(
        hash: string,
        config: TransactionConfig,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ): Promise<void>
    cancelRequest(
        hash: string,
        config: TransactionConfig,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ): Promise<void>
}

export interface Context {
    readonly account: string
    readonly chainId: ChainId
    readonly requestId: number
    readonly writeable: boolean
    readonly providerType: ProviderType
    readonly method: EthereumMethodType
    readonly connection: Connection
    readonly sendOverrides: SendOverrides | undefined
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
