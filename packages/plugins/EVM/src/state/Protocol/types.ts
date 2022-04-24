import type { RequestArguments, TransactionReceipt } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { NetworkPluginID, Web3Helper, Web3Plugin } from '@masknet/plugin-infra/web3'
import type {
    Web3,
    ChainId,
    ProviderType,
    EIP1193Provider,
    EthereumMethodType,
    Transaction,
} from '@masknet/web3-shared-evm'

export type EVM_Web3 = Web3

export type EVM_Web3State = Web3Helper.Web3State<NetworkPluginID.PLUGIN_EVM>

export type EVM_Web3UI = Web3Helper.Web3UI<NetworkPluginID.PLUGIN_EVM>

export type EVM_ConnectionOptions = Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_EVM>

export interface EVM_Provider extends Web3Plugin.WalletProvider<ChainId, EIP1193Provider, Web3> {
    /** The basic RPC request method. */
    request<T extends unknown>(requestArguments: RequestArguments): Promise<T>
}

export interface EVM_Connection extends Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_EVM> {
    getCode(address: string, options?: EVM_ConnectionOptions): Promise<string>
    getTransactionReceiptHijacked(hash: string, options?: EVM_ConnectionOptions): Promise<TransactionReceipt | null>
    getTransactionReceipt(hash: string, options?: EVM_ConnectionOptions): Promise<TransactionReceipt | null>

    confirmRequest(options?: EVM_ConnectionOptions): Promise<void>
    rejectRequest(options?: EVM_ConnectionOptions): Promise<void>
    replaceRequest(hash: string, config: Transaction, options?: EVM_ConnectionOptions): Promise<void>
    cancelRequest(hash: string, config: Transaction, options?: EVM_ConnectionOptions): Promise<void>
}

export interface Context {
    readonly account: string
    readonly chainId: ChainId
    readonly requestId: number
    readonly writeable: boolean
    readonly providerType: ProviderType
    readonly method: EthereumMethodType
    readonly connection: Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_EVM>
    readonly requestOptions: Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_EVM> | undefined

    /**
     * JSON RPC request payload
     */
    readonly request: JsonRpcPayload

    /**
     * JSON RPC response object
     */
    readonly response: JsonRpcResponse | undefined

    config: Transaction | undefined
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
