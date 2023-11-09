import { type ChainId, getCoinGeckoConstants, isNativeTokenAddress } from '@masknet/web3-shared-solana'
import { getTokenPriceByCoinId, getTokenPrice } from './base.js'
import type { BaseHubOptions, PriceAPI } from '../../entry-types.js'

class CoinGeckoPriceAPI_Solana implements PriceAPI.Provider<ChainId> {
    getFungibleTokenPrice(chainId: ChainId, address: string, options?: BaseHubOptions<ChainId>) {
        const { PLATFORM_ID = '', COIN_ID = '' } = getCoinGeckoConstants(options?.chainId ?? chainId)

        if (isNativeTokenAddress(address)) {
            return getTokenPriceByCoinId(COIN_ID, options?.currencyType)
        }
        return getTokenPrice(PLATFORM_ID, address, options?.currencyType)
    }
}
export const CoinGeckoPriceSolana = new CoinGeckoPriceAPI_Solana()
