import { memoize } from 'lodash-es'
import type { Connection } from '@solana/web3.js'
import { type ChainId, createClient } from '@masknet/web3-shared-solana'
import { SolanaConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import { SolanaProviders } from '../providers/index.js'
import type { ConnectionOptions } from '../types/index.js'

const createWeb3SDK = memoize(
    (chainId: ChainId) => createClient(chainId),
    (chainId) => chainId,
)

export class SolanaWeb3API {
    constructor(private options?: ConnectionOptions) {
        this.ConnectionOptions = new SolanaConnectionOptionsAPI(this.options)
    }
    private ConnectionOptions
    getProviderInstance(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return SolanaProviders[options.providerType]
    }

    getWeb3(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getProviderInstance(options).createWeb3(options)
    }

    getWeb3Provider(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getProviderInstance(options).createWeb3Provider(options)
    }

    getWeb3Connection(initial?: ConnectionOptions): Connection {
        const options = this.ConnectionOptions.fill(initial)
        return createWeb3SDK(options.chainId)
    }
}
