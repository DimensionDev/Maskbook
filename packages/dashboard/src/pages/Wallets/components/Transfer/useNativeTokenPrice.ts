import { useCallback, useEffect, useState } from 'react'
import { useInterval } from 'react-use'
import { CryptoPrice, CurrencyType, getCoinGeckoCoinId, useChainId } from '@masknet/web3-shared-evm'
import { UPDATE_CHAIN_STATE_DELAY } from '@masknet/plugin-wallet'

const URL_BASE = 'https://api.coingecko.com/api/v3'
async function getNativeTokenPrice(tokenId: string, currency: CurrencyType) {
    const requestPath = `${URL_BASE}/simple/price?ids=${tokenId}&vs_currencies=${currency}`
    const prices = await fetch(requestPath).then((r) => r.json() as Promise<CryptoPrice>)
    return prices
}

const USD = CurrencyType.USD

export function useNativeTokenPrice() {
    const chainId = useChainId()
    const coinId = getCoinGeckoCoinId(chainId)
    const [price, setPrice] = useState(0)

    const trackPrice = useCallback(() => {
        if (!coinId) {
            return
        }
        getNativeTokenPrice(coinId, USD).then((result) => {
            setPrice(result[coinId][USD])
        })
    }, [coinId])

    useEffect(trackPrice, [trackPrice])
    useInterval(trackPrice, UPDATE_CHAIN_STATE_DELAY)

    return price
}
