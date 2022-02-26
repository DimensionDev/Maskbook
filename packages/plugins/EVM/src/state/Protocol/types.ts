import type Web3 from 'web3'
import type { RequestArguments } from 'web3-core'
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
import type { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'

export interface ProviderOptions {
    chainId?: ChainId
    url?: string
    site?: EnhanceableSite | ExtensionSite
}

export interface Web3Options {
    keys?: string[]
    options?: ProviderOptions
}

export interface Provider {
    request<T extends unknown>(requestArguments: RequestArguments): Promise<T>

    createWeb3(options?: Web3Options): Promise<Web3>
    createExternalProvider(options?: ProviderOptions): Promise<ExternalProvider>

    onAccountsChanged?(site: EnhanceableSite | ExtensionSite, accounts: string[]): Promise<void>
    onChainChanged?(site: EnhanceableSite | ExtensionSite, id: string): Promise<void>
    onDisconnect?(site: EnhanceableSite | ExtensionSite): Promise<void>
}

export interface Context {
    readonly account: string
    readonly chainId: ChainId
    readonly requestId: number
    readonly writeable: boolean
    readonly providerType: ProviderType
    readonly method: EthereumMethodType
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
