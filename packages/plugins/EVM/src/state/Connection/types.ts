import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID, WalletProvider } from '@masknet/web3-shared-base'
import type {
    Web3,
    ChainId,
    ProviderType,
    EthereumMethodType,
    Transaction,
    Web3Provider,
} from '@masknet/web3-shared-evm'

export interface EVM_Web3State extends Web3Helper.Web3State<NetworkPluginID.PLUGIN_EVM> {}

export interface EVM_Web3ConnectionOptions extends Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_EVM> {}

export interface EVM_Provider extends WalletProvider<ChainId, ProviderType, Web3Provider, Web3> {}

export interface EVM_Connection extends Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_EVM> {}

export interface ERC721Metadata {
    name: string
    description: string
    image: string
}

export interface ERC1155Metadata {
    name: string
    decimals: number
    description: string
    image: string
}

export interface Context {
    readonly account: string
    readonly chainId: ChainId
    readonly requestId: number
    readonly writeable: boolean
    readonly providerType: ProviderType
    readonly method: EthereumMethodType
    readonly connection: EVM_Connection
    readonly requestOptions: EVM_Web3ConnectionOptions | undefined

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

    toJSON: () => object
}

export interface Middleware<T> {
    fn: (context: T, next: () => Promise<void>) => Promise<void>
}

export interface Translator {
    encode?(context: Context): Promise<void>
    decode?(context: Context): Promise<void>
}
