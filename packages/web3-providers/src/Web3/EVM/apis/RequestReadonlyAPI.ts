import { memoize } from 'lodash-es'
import Web3 from 'web3'
import {
    createWeb3ProviderFromRequest,
    ProviderURL,
    PayloadEditor,
    type RequestArguments,
} from '@masknet/web3-shared-evm'
import { ConnectionOptionsReadonlyAPI } from './ConnectionOptionsReadonlyAPI.js'
import { fetchJsonRpcResponse } from '../../../helpers/fetchJsonRpcResponse.js'
import type { ConnectionOptions } from '../types/index.js'

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

            return (
                await fetchJsonRpcResponse(
                    providerURL,
                    PayloadEditor.fromMethod(requestArguments.method, requestArguments.params).fill(),
                )
            ).result as T
        }
    }

    getWeb3(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return createWeb3SDK(options.providerURL ?? ProviderURL.from(options.chainId))
    }

    getWeb3Provider(initial?: ConnectionOptions) {
        return createWeb3ProviderFromRequest((requestArguments) => this.request(requestArguments, initial))
    }
}
