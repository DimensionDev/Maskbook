import type { HubIndicator, HubOptions } from '@masknet/web3-shared-base'
import { ChainId, getCoinGeckoConstants, isNativeTokenAddress, isValidAddress } from '@masknet/web3-shared-evm'
import type { PriceAPI } from '../../types/index.js'
import { getTokenPrice, getTokenPriceByCoinId } from './base.js'

export class CoinGeckoPriceEVM_API implements PriceAPI.Provider<ChainId> {
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
