import { memoize } from 'lodash-es'
import type { Connection } from '@solana/web3.js'
import { type ChainId, createClient } from '@masknet/web3-shared-solana'
import { SolanaConnectionOptionsAPI } from './ConnectionOptionsAPI.js'
import type { SolanaConnectionOptions } from '../types/index.js'
import { solana } from '../../../Manager/registry.js'
import type { SolanaProvider } from '../state/Provider.js'

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
        return (solana.state!.Provider as SolanaProvider).providers[options.providerType]
    }

    getConnection(initial?: SolanaConnectionOptions): Connection {
        const options = this.ConnectionOptions.fill(initial)
        return createWeb3SDK(options.chainId)
    }
}
