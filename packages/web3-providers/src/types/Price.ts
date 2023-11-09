import type { BaseHubOptions } from '../entry-types.js'

export namespace PriceAPI {
    export interface Provider<ChainId> {
        getFungibleTokenPrice?: (
            chainId: ChainId,
            account: string,
            options?: BaseHubOptions<ChainId>,
        ) => Promise<number | undefined>
    }
}
