import { memoize } from 'lodash-es'
import type { Connection } from '@solana/web3.js'
import { type ChainId, createClient } from '@masknet/web3-shared-solana'
import { SolanaConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import { SolanaWalletProviders } from '../providers/index.js'
import type { SolanaConnectionOptions } from '../types/index.js'

const createWeb3SDK = memoize(
    (chainId: ChainId) => createClient(chainId),
    (chainId) => chainId,
)

export class SolanaWeb3API {
    constructor(private options?: SolanaConnectionOptions) {
        this.ConnectionOptions = new SolanaConnectionOptionsAPI(this.options)
    }
    private ConnectionOptions
    getProviderInstance(initial?: SolanaConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return SolanaWalletProviders[options.providerType]
    }

    getWeb3(initial?: SolanaConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getProviderInstance(options).createWeb3(options)
    }

    getWeb3Provider(initial?: SolanaConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return this.getProviderInstance(options).createWeb3Provider(options)
    }

    getWeb3Connection(initial?: SolanaConnectionOptions): Connection {
        const options = this.ConnectionOptions.fill(initial)
        return createWeb3SDK(options.chainId)
    }
}
