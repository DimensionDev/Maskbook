import { memoize } from 'lodash-es'
import Web3 from 'web3'
import type { RequestArguments } from 'web3-core'
import { createWeb3Provider, ProviderURL, PayloadEditor } from '@masknet/web3-shared-evm'
import { ConnectionOptionsReadonlyAPI } from './ConnectionOptionsReadonlyAPI.js'
import type { ConnectionOptions } from '../types/index.js'
import { fetchJsonRpcResponse } from '../../../helpers/fetchJsonRpcResponse.js'

const createWeb3SDK = memoize(
    (url: string) => new Web3(url),
    (url) => url.toLowerCase(),
)

export class RequestReadonlyAPI {
    constructor(protected options?: ConnectionOptions) {}

    protected ConnectionOptions = new ConnectionOptionsReadonlyAPI(this.options)

    get request() {
        return async <T>(requestArguments: RequestArguments, initial?: ConnectionOptions) => {
            const options = this.ConnectionOptions.fill(initial)
            const providerURL = options.providerURL ?? ProviderURL.from(options.chainId)

            return (await fetchJsonRpcResponse(
                providerURL,
                PayloadEditor.fromMethod(requestArguments.method, requestArguments.params).fill(),
            )) as T
        }
    }

    getWeb3(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return createWeb3SDK(options.providerURL ?? ProviderURL.from(options.chainId))
    }

    getWeb3Provider(initial?: ConnectionOptions) {
        return createWeb3Provider((requestArguments) => this.request(requestArguments, initial))
    }
}
