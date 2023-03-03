import type { HubIndicator, HubOptions } from '@masknet/web3-shared-base'
import { type ChainId, getCoinGeckoConstants, isNativeTokenAddress, isValidAddress } from '@masknet/web3-shared-evm'
import { getTokenPrice, getTokenPriceByCoinId } from './base.js'
import type { PriceAPI } from '../../entry-types.js'

export class CoinGeckoPriceAPI_EVM implements PriceAPI.Provider<ChainId> {
    async getFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        options?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<number> {
        const { PLATFORM_ID = '', COIN_ID = '' } = getCoinGeckoConstants(options?.chainId ?? chainId)

        if (isNativeTokenAddress(address) || !isValidAddress(address)) {
            return getTokenPriceByCoinId(COIN_ID, options?.currencyType)
        }
        return getTokenPrice(PLATFORM_ID, address, options?.currencyType)
    }
}
