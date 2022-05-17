import type { Plugin } from '@masknet/plugin-infra'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { CurrencyType, TokenPriceState } from '@masknet/web3-shared-base'
import { CoinGecko } from '@masknet/web3-providers'

export class TokenPrice implements TokenPriceState<ChainId> {
    constructor(protected context: Plugin.Shared.SharedContext) {}

    async getFungibleTokenPrice(chainId: ChainId, address: string, currencyType?: CurrencyType | undefined) {
        return CoinGecko.getTokenPrice(address, currencyType)
    }

    async getNonFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        tokenId: string,
        currencyType?: CurrencyType | undefined,
    ) {
        return 0
    }
}
