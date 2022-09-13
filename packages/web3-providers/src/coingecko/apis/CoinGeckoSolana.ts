import type { HubIndicator, HubOptions } from '@masknet/web3-shared-base'
import { ChainId, getCoinGeckoConstants, isNativeTokenAddress } from '@masknet/web3-shared-solana'
import type { PriceAPI } from '../../types/index.js'
import { getTokenPriceByCoinId, getTokenPrice } from './base.js'

export class CoinGeckoPriceSolanaAPI implements PriceAPI.Provider<ChainId> {
    getFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        options?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<number> {
        const { PLATFORM_ID = '', COIN_ID = '' } = getCoinGeckoConstants(options?.chainId ?? chainId)

        if (isNativeTokenAddress(address)) {
            return getTokenPriceByCoinId(COIN_ID, options?.currencyType)
        }
        return getTokenPrice(PLATFORM_ID, address, options?.currencyType)
    }
}
