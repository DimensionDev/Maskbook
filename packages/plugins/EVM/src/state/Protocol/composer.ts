import type { RequestArguments } from 'web3-core'
import {
    getPayloadChainId,
    getPayloadConfig,
    getPayloadFrom,
    ProviderType,
    EthereumMethodType,
    Transaction,
    ChainId,
} from '@masknet/web3-shared-evm'
import { getError, hasError } from './error'
import type { Context, EVM_Connection, EVM_Web3ConnectionOptions, Middleware } from './types'
import { SharedContextSettings, Web3StateSettings } from '../../settings'
import { AddressBook } from './middleware/AddressBook'
import { Interceptor } from './middleware/Interceptor'
import { Nonce } from './middleware/Nonce'
import { Popup } from './middleware/Popup'
import { Squash } from './middleware/Squash'
import { RecentTransaction } from './middleware/Transaction'
import { Translator } from './middleware/Translator'

class Composer<T> {
    private listOfMiddleware: Middleware<T>[] = []

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

    get writeable() {
        return this._writeable
    }

    get account() {
        return getPayloadFrom(this.request) ?? this._options?.account ?? this._account
    }

    get chainId() {
        return getPayloadChainId(this.request) ?? this._options?.chainId ?? this._chainId
    }

    get providerType() {
        return this.requestOptions?.providerType ?? this._providerType
    }

    get method() {
        return this.request.method as EthereumMethodType
    }

    get config() {
        return getPayloadConfig(this.request)
    }

    set config(config: Transaction | undefined) {
        if (!this.config || !config) return
        this._requestArguments = {
            method: this.method,
            params: [config, 'latest'],
        }
    }

    get connection() {
        return this._connection
    }

    get requestId() {
        return this.id
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
        return {
            id: this.id,
            jsonrpc: '2.0',
            params: [],
            ...this.requestArguments,
        }
    }

    get response() {
        if (this._writeable) return
        return {
            id: this.id,
            jsonrpc: '2.0',
            result: this._result,
        }
    }

    get error() {
        if (this._writeable) return null
        if (hasError(this._error, this.response)) return getError(this._error, this.response, 'Failed to send request.')
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
composer.use(new Popup())
composer.use(new RecentTransaction())
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
