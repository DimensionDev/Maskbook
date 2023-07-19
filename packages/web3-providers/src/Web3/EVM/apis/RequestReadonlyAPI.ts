import { memoize } from 'lodash-es'
import Web3 from 'web3'
import type { HttpProvider, RequestArguments } from 'web3-core'
import { createWeb3Provider, ProviderURL, createWeb3Request, PayloadEditor } from '@masknet/web3-shared-evm'
import { ConnectionOptionsReadonlyAPI } from './ConnectionOptionsReadonlyAPI.js'
import { Web3StateRef } from './Web3StateAPI.js'
import type { ConnectionOptions } from '../types/index.js'

const createWeb3SDK = memoize(
    (url: string) => new Web3(url),
    (url) => url.toLowerCase(),
)

export class RequestReadonlyAPI {
    constructor(protected options?: ConnectionOptions) {}

    private get Network() {
        if (!Web3StateRef.value.Network) throw new Error('The web3 state does not load yet.')
        return Web3StateRef.value.Network
    }

    protected ConnectionOptions = new ConnectionOptionsReadonlyAPI(this.options)

    get customNetworkProviderURL() {
        const networkID = this.Network.networkID?.getCurrentValue()
        const networks = this.Network.networks?.getCurrentValue()

        if (networkID && networks?.length) {
            const network = networks.find((x) => x.ID === networkID && x.isCustomized)
            return network?.rpcUrl
        }
        return
    }

    get request() {
        return async <T>(requestArguments: RequestArguments, initial?: ConnectionOptions) => {
            return (await this.getWeb3Provider(initial).request(
                PayloadEditor.fromMethod(requestArguments.method, requestArguments.params).fill(),
            )) as T
        }
    }

    getWeb3(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return createWeb3SDK(this.customNetworkProviderURL ?? ProviderURL.from(options.chainId))
    }

    getWeb3Provider(initial?: ConnectionOptions) {
        const provider = this.getWeb3(initial).currentProvider as HttpProvider
        return createWeb3Provider(createWeb3Request(provider.send.bind(provider)))
    }
}
