import type { HubOptions } from '@masknet/web3-shared-base'

export namespace PriceAPI {
    export interface Provider<ChainId> {
        getFungibleTokenPrice?: (
            chainId: ChainId,
            account: string,
            options?: HubOptions<ChainId>,
        ) => Promise<number | undefined>
    }
}
