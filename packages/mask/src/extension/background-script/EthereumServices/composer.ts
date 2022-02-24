import {
    addGasMargin,
    getPayloadChainId,
    getPayloadConfig,
    getPayloadFrom,
    isEIP1559Supported,
    RequestOptions,
    SendOverrides,
    ProviderType,
    EthereumMethodType,
} from '@masknet/web3-shared-evm'
import type { RequestArguments } from 'web3-core'
import type { JsonRpcResponse } from 'web3-core-helpers'
import { toHex } from 'web3-utils'
import { Flags } from '../../../../shared'
import {
    currentAccountSettings,
    currentChainIdSettings,
    currentMaskWalletAccountSettings,
    currentMaskWalletChainIdSettings,
    currentProviderSettings,
} from '../../../plugins/Wallet/settings'
import { getError, hasError } from './error'
import type { Context, Middleware } from './types'

class Composer<T> {
    private middlewares: Middleware<T>[] = []

    private compose() {
        return (context: T, next: () => Promise<void>) => {
            let index = -1
            const dispatch = (i: number): Promise<void> => {
                if (i <= index) return Promise.reject(new Error('next() called multiple times'))
                index = i
                let fn
                if (i >= this.middlewares.length) fn = next
                else fn = this.middlewares[i].fn.bind(this.middlewares[i])
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
        this.middlewares.push(middleware)
    }

    public async dispatch(context: T, next: () => Promise<void>) {
        await this.compose()(context, next)
    }
}

let pid = 0

class RequestContext implements Context {
    private id = pid++
    private writeable = true
    private rawError: Error | null = null
    private rawResult: unknown
    private rawAccount = currentAccountSettings.value
    private rawChainId = currentChainIdSettings.value
    private rawProviderType = currentProviderSettings.value
    private responseCallbacks: ((error: Error | null, response?: JsonRpcResponse) => void)[] = []

    constructor(
        private rawRequestArguments: RequestArguments,
        private rawOverrides?: SendOverrides,
        private rawOptions?: RequestOptions,
    ) {
        if (this.providerType === ProviderType.MaskWallet) {
            this.rawAccount = currentMaskWalletAccountSettings.value
            this.rawChainId = currentMaskWalletChainIdSettings.value
        }
    }

    get account() {
        return getPayloadFrom(this.request) ?? this.sendOverrides?.account ?? this.rawAccount
    }

    get chainId() {
        return getPayloadChainId(this.request) ?? this.sendOverrides?.chainId ?? this.rawChainId
    }

    get providerType() {
        return this.sendOverrides?.providerType ?? this.rawProviderType
    }

    get method() {
        return this.request.method as EthereumMethodType
    }

    get config() {
        const config = {
            ...getPayloadConfig(this.request),
        }

        // add gas margin
        if (config.gas) config.gas = toHex(addGasMargin(config.gas as string).toFixed())

        // add chain id
        if (!config.chainId) config.chainId = this.chainId

        // fix gas price
        if (Flags.EIP1559_enabled && isEIP1559Supported(this.chainId)) {
            delete config.gasPrice
        } else {
            delete config.maxFeePerGas
            delete config.maxPriorityFeePerGas
        }

        return config
    }

    get sendOverrides() {
        return this.rawOverrides
    }

    get requestId() {
        return this.id
    }

    get requestOptions() {
        return this.rawOptions
    }

    get requestArguments() {
        return this.rawRequestArguments
    }

    set requestArguments(requestArguments: RequestArguments) {
        this.rawRequestArguments = requestArguments
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
        if (this.writeable) return
        if (this.error) return
        return {
            id: this.id,
            jsonrpc: '2.0',
            result: this.rawResult,
        }
    }

    get error() {
        if (this.writeable) return null
        if (hasError(this.rawError, this.response))
            return getError(this.rawError, this.response, 'Failed to send request.')
        return null
    }

    set error(error: Error | null) {
        this.rawError = error
    }

    get result() {
        return this.rawResult
    }

    set result(result: unknown) {
        this.rawResult = result
    }

    write(result?: unknown) {
        this.end(null, result)
    }

    abort(error: unknown, fallback = 'Failed to send transaction.') {
        this.end(error instanceof Error ? error : new Error(fallback))
    }

    end(error: Error | null = null, result?: unknown) {
        if (!this.writeable) return
        this.writeable = false
        this.error = error
        this.result = result
        this.responseCallbacks.forEach((x) => x(this.error, this.response))
    }

    onResponse(callback: (error: Error | null, response?: JsonRpcResponse) => void) {
        if (!this.responseCallbacks.includes(callback)) this.responseCallbacks.push(callback)
    }
}

const composer = new Composer<Context>()

export function use(middleware: Middleware<Context>) {
    return composer.use(middleware)
}

export function dispatch(context: Context, next: () => Promise<void>) {
    return composer.dispatch(context, next)
}

export function createContext(requestArguments: RequestArguments, overrides?: SendOverrides, options?: RequestOptions) {
    return new RequestContext(requestArguments, overrides, options)
}
