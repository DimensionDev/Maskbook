import { HubIndicator, HubOptions, attemptUntil } from '@masknet/web3-shared-base'
import { ChainId, getCoinGeckoConstants, isNativeTokenAddress, isValidAddress } from '@masknet/web3-shared-evm'
import type { PriceAPI } from '../../types/index.js'
import { getTokenPrice, getTokenPriceByCoinId } from './base.js'
import { COINGECKO_URL_BASE, COINGECKO_CHAIN_ID_LIST } from '../constants.js'
import { fetchJSON } from '../../helpers.js'

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

    async getCoinNameByAddress(address: string): Promise<{ name: string; chainId: ChainId } | undefined> {
        return attemptUntil(
            COINGECKO_CHAIN_ID_LIST.map((chainId) => async () => {
                try {
                    const { PLATFORM_ID = '' } = getCoinGeckoConstants(chainId)
                    const requestPath = `${COINGECKO_URL_BASE}/coins/${PLATFORM_ID}/contract/${address}`
                    const response = await fetchJSON<{ name: string; error: string }>(requestPath)
                    return response.error ? undefined : { name: response.name, chainId }
                } catch {
                    return undefined
                }
            }),
            undefined,
        )
    }
}
