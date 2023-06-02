import { memoize } from 'lodash-es'
import { type ChainId, type Web3Provider, createClient } from '@masknet/web3-shared-flow'
import { FlowConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import { FlowProviders } from '../providers/index.js'
import type { ConnectionOptions } from '../types/index.js'

const createWeb3SDK = memoize(
    (chainId: ChainId) => createClient(chainId),
    (chainId) => chainId,
)

export class FlowWeb3API {
    constructor(private options?: ConnectionOptions) {}

    private ConnectionOptions = new FlowConnectionOptionsAPI(this.options)

    getWeb3(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return createWeb3SDK(options.chainId)
    }

    getWeb3Provider(initial?: ConnectionOptions): Web3Provider {
        throw new Error('Method not implemented.')
    }

    getWeb3ProviderInstance(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return FlowProviders[options.providerType]
    }
}
