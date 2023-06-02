import type { HubOptions_Base } from '../entry-types.js'

export namespace PriceAPI {
    export interface Provider<ChainId> {
        getFungibleTokenPrice?: (
            chainId: ChainId,
            account: string,
            options?: HubOptions_Base<ChainId>,
        ) => Promise<number | undefined>
    }
}
