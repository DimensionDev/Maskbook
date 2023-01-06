import type { RequestArguments } from 'web3-core'
import {
    ProviderType,
    EthereumMethodType,
    Transaction,
    ChainId,
    ErrorEditor,
    PayloadEditor,
    createJsonRpcPayload,
    createJsonRpcResponse,
} from '@masknet/web3-shared-evm'
import type { Context, EVM_Connection, EVM_Web3ConnectionOptions, Middleware } from './types.js'
import { SharedContextSettings, Web3StateSettings } from '../../settings/index.js'
import { AddressBook } from './middleware/AddressBook.js'
import { Interceptor } from './middleware/Interceptor.js'
import { Nonce } from './middleware/Nonce.js'
import { Squash } from './middleware/Squash.js'
import { RecentTransaction } from './middleware/RecentTransaction.js'
import { Translator } from './middleware/Translator.js'
import { TransactionWatcher } from './middleware/TransactionWatcher.js'
import { Providers } from './provider.js'
import type { BaseContractWalletProvider } from './providers/BaseContractWallet.js'

class Composer<T> {
    private listOfMiddleware: Array<Middleware<T>> = []

    private compose() {
        return (context: T, next: () => Promise<void>) => {
            let index = -1
            const dispatch = (i: number): Promise<void> => {
                if (i <= index) return Promise.reject(new Error('next() called multiple times'))
                index = i
                let fn
                if (i >= this.listOfMiddleware.length) fn = next
                else fn = this.listOfMiddleware[i].fn.bind(this.listOfMiddleware[i])
                if (!fn) return Promise.resolve()
                try {
                    return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
                } catch (err) {
                    return Promise.reject(err)
                }
            }

            return dispatch(0)
        }
    }

    public use(middleware: Middleware<T>) {
        this.listOfMiddleware.push(middleware)
    }

    public async dispatch(context: T, next: () => Promise<void>) {
        await this.compose()(context, next)
    }
}

let pid = 0

class RequestContext implements Context {
    private id = pid
    private _writeable = true
    private _error: Error | null = null
    private _result: unknown
    private _account = Web3StateSettings.value.Provider?.account?.getCurrentValue() ?? ''
    private _chainId = Web3StateSettings.value.Provider?.chainId?.getCurrentValue() ?? ChainId.Mainnet
    private _providerType = Web3StateSettings.value.Provider?.providerType?.getCurrentValue() ?? ProviderType.MaskWallet

    constructor(
        private _connection: EVM_Connection,
        private _requestArguments: RequestArguments,
        private _options?: EVM_Web3ConnectionOptions,
    ) {
        // increase pid
        pid += 1
        this.id = pid

        // mask wallet settings
        if (this.providerType === ProviderType.MaskWallet) {
            const { account, chainId } = SharedContextSettings.value
            this._account = account.getCurrentValue()
            this._chainId = chainId.getCurrentValue()
        }
    }

    private get errorEditor() {
        return ErrorEditor.from(this._error, this.response, 'Failed to send request.')
    }

    private get payloadEditor() {
        return PayloadEditor.fromPayload(this.request)
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
        return this.requestOptions?.providerType ?? this._providerType
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
        return this.payloadEditor.config
    }

    get userOperation() {
        return this.payloadEditor.userOperation
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

    get proof() {
        return this.payloadEditor.proof
    }

    get connection() {
        return this._connection
    }

    get requestId() {
        return this.id
    }

    get owner() {
        const provider = Providers[this.providerType] as BaseContractWalletProvider | undefined
        return this._options?.owner ?? provider?.owner
    }

    get identifier() {
        const provider = Providers[this.providerType] as BaseContractWalletProvider | undefined
        return this._options?.identifier ?? provider?.identifier
    }

    get requestOptions() {
        return this._options
    }

    get requestArguments() {
        return this._requestArguments
    }

    set requestArguments(requestArguments: RequestArguments) {
        this._requestArguments = requestArguments
    }

    get request() {
        return createJsonRpcPayload(this.id, {
            params: [],
            ...this.requestArguments,
        })
    }

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

    write(result?: unknown) {
        this.end(null, result)
    }

    abort(error: unknown, fallback = 'Failed to send request.') {
        this.end((error as Error) || new Error(fallback))
    }

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

const composer = new Composer<Context>()

composer.use(new Squash())
composer.use(new Nonce())
composer.use(new Translator())
composer.use(new Interceptor())
composer.use(new RecentTransaction())
composer.use(new TransactionWatcher())
composer.use(new AddressBook())

export function dispatch(context: Context, next: () => Promise<void>) {
    return composer.dispatch(context, next)
}

export function createContext(
    connection: EVM_Connection,
    requestArguments: RequestArguments,
    options?: EVM_Web3ConnectionOptions,
) {
    return new RequestContext(connection, requestArguments, options)
}
