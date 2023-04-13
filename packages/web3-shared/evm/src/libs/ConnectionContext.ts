import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import type { ECKeyIdentifier, SignType } from '@masknet/shared-base'
import { ErrorEditor } from './ErrorEditor.js'
import { PayloadEditor } from './PayloadEditor.js'
import { createJsonRpcPayload, createJsonRpcResponse } from '../helpers/provider.js'
import {
    ChainId,
    EthereumMethodType,
    ProviderType,
    type Transaction,
    type TransactionOptions,
    type Web3State,
    type Web3Connection,
    type Web3ConnectionOptions,
} from '../types/index.js'

let pid = 0

export class ConnectionContext {
    private id = 0
    private _writeable = true
    private _error: Error | null = null
    private _result: unknown
    private _account = ''
    private _chainId = ChainId.Mainnet
    private _providerType = ProviderType.MaskWallet

    constructor(
        private _state: Web3State,
        private _connection: Web3Connection,
        private _requestArguments: RequestArguments,
        private _options?: Web3ConnectionOptions,
        private _init?: {
            getDefaultAccount?: (providerType: ProviderType) => string | undefined
            getDefaultChainId?: (providerType: ProviderType) => ChainId | undefined
            getDefaultProviderType: () => ProviderType | undefined
            getDefaultOwner?: (providerType: ProviderType) => string | undefined
            getDefaultIdentifier?: (providerType: ProviderType) => ECKeyIdentifier | undefined
            mask_send?: (request: JsonRpcPayload, options: TransactionOptions) => Promise<JsonRpcResponse>
            mask_signWithPersona?: <T>(
                type: SignType,
                message: T,
                identifier?: ECKeyIdentifier,
                silent?: boolean,
            ) => Promise<string>
        },
    ) {
        // increase pid
        pid += 1
        this.id = pid

        this._account = this._init?.getDefaultAccount?.(this.providerType) ?? ''
        this._chainId = this._init?.getDefaultChainId?.(this.providerType) ?? ChainId.Mainnet
        this._providerType = this._init?.getDefaultProviderType() ?? ProviderType.MaskWallet
    }

    private get errorEditor() {
        return ErrorEditor.from(this._error, this.response, 'Failed to send request.')
    }

    private get payloadEditor() {
        return PayloadEditor.fromPayload(this.request, this._options)
    }

    get writeable() {
        return this._writeable
    }

    get account() {
        return this.payloadEditor.from ?? this._options?.account ?? this._account
    }

    get chainId() {
        return this.payloadEditor.chainId ?? this._options?.chainId ?? this._chainId
    }

    get providerType() {
        return this.requestOptions?.providerType ?? this._options?.providerType ?? this._providerType
    }

    get method() {
        return this.request.method as EthereumMethodType
    }

    get risky() {
        return this.payloadEditor.risky
    }

    get message() {
        return this.payloadEditor.signableMessage
    }

    get config() {
        return {
            ...this.payloadEditor.config,
            ...this._options?.overrides,
            from: this._options?.overrides?.from || this.payloadEditor.config?.from,
            chainId:
                typeof this._options?.overrides?.chainId === 'string'
                    ? Number.parseInt(this._options?.overrides?.chainId, 10)
                    : this.payloadEditor.config?.chainId,
        }
    }

    set config(config: Transaction | undefined) {
        if (!this.config || !config) return
        const method = this._requestArguments.method

        switch (method) {
            case EthereumMethodType.MASK_REPLACE_TRANSACTION:
                this._requestArguments = {
                    method: this.method,
                    params: [this._requestArguments.params[0], config],
                }
                break
            case EthereumMethodType.ETH_SEND_TRANSACTION:
                this._requestArguments = {
                    method: this.method,
                    params: [config, 'latest'],
                }
                break
            default:
                break
        }
    }

    get wallet() {
        return this.payloadEditor.wallet
    }

    get userOperation() {
        return this.payloadEditor.userOperation
    }

    get proof() {
        return this.payloadEditor.proof
    }

    get connection() {
        return this._connection
    }

    get state() {
        return this._state
    }

    get bridge() {
        return {
            send: this._init?.mask_send,
            signWithPersona: this._init?.mask_signWithPersona,
        }
    }

    get requestId() {
        return this.id
    }

    /**
     * Abstract account owner address
     */
    get owner() {
        return this.payloadEditor.owner || this._options?.owner || this._init?.getDefaultOwner?.(this.providerType)
    }

    /**
     * Abstract account owner persona public key
     */
    get identifier() {
        return (
            this.payloadEditor.identifier ||
            this._options?.identifier ||
            this._init?.getDefaultIdentifier?.(this.providerType)
        )
    }

    get paymentToken() {
        return this._options?.paymentToken
    }

    get requestOptions() {
        return {
            ...this._options,
        }
    }

    get requestArguments() {
        return this._requestArguments
    }

    set requestArguments(requestArguments: RequestArguments) {
        this._requestArguments = requestArguments
    }

    /**
     * JSON RPC request payload
     */
    get request() {
        return createJsonRpcPayload(this.id, {
            params: [],
            ...this.requestArguments,
        })
    }

    /**
     * JSON RPC response object
     */
    get response() {
        if (this._writeable) return
        return createJsonRpcResponse(this.id, this._result)
    }

    get error() {
        if (this._writeable) return null
        if (this.errorEditor.presence) return this.errorEditor.error
        return null
    }

    set error(error: Error | null) {
        this._error = error
    }

    get result() {
        return this._result
    }

    set result(result: unknown) {
        this._result = result
    }

    /**
     * Resolve a request and write down the result into the context. Alias of end(null, result)
     */
    write(result?: unknown) {
        this.end(null, result)
    }

    /**
     * Reject a request and throw an error. Alias of end(error)
     */
    abort(error: unknown, fallback = 'Failed to send request.') {
        this.end((error as Error) || new Error(fallback))
    }

    /**
     * Seal a request by resolving or rejecting it.
     */
    end(error: Error | null = null, result?: unknown) {
        if (!this._writeable) return
        this._writeable = false
        this.error = error
        this.result = result
    }

    toJSON() {
        return {}
    }
}
