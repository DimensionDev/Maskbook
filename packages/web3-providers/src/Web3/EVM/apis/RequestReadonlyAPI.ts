import { memoize } from 'lodash-es'
import Web3 from 'web3'
import type { HttpProvider, RequestArguments } from 'web3-core'
import { createWeb3Provider, ProviderURL, createWeb3Request, PayloadEditor } from '@masknet/web3-shared-evm'
import { ConnectionOptionsReadonlyAPI } from './ConnectionOptionsReadonlyAPI.js'
import type { ConnectionOptions } from '../types/index.js'

const createWeb3SDK = memoize(
    (url: string) => new Web3.default(url),
    (url) => url.toLowerCase(),
)

export class RequestReadonlyAPI {
    constructor(protected options?: ConnectionOptions) {}

    protected ConnectionOptions = new ConnectionOptionsReadonlyAPI(this.options)

    get request() {
        return async <T>(requestArguments: RequestArguments, initial?: ConnectionOptions) => {
            return (await this.getWeb3Provider(initial).request(
                PayloadEditor.fromMethod(requestArguments.method, requestArguments.params).fill(),
            )) as T
        }
    }

    getWeb3(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return createWeb3SDK(ProviderURL.from(options.chainId))
    }

    getWeb3Provider(initial?: ConnectionOptions) {
        const provider = this.getWeb3(initial).currentProvider as HttpProvider
        return createWeb3Provider(createWeb3Request(provider.send.bind(provider)))
    }
}
