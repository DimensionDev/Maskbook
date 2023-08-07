import type { Connection } from '@solana/web3.js'
import { BitcoinConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import { BitcoinProviders } from '../providers/index.js'
import type { ConnectionOptions } from '../types/index.js'

export class BitcoinWeb3API {
    constructor(private options?: ConnectionOptions) {}

    private ConnectionOptions = new BitcoinConnectionOptionsAPI(this.options)

    getProviderInstance(initial?: ConnectionOptions) {
        const options = this.ConnectionOptions.fill(initial)
        return BitcoinProviders[options.providerType]
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
        // const options = this.ConnectionOptions.fill(initial)
        // return createWeb3SDK(options.chainId)
        throw new Error('To be implemented.')
    }
}
