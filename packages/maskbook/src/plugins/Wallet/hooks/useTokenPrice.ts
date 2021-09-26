import { useEffect, useState } from 'react'
import { pollingTask } from '@masknet/shared'
import { UPDATE_CHAIN_STATE_DELAY } from '@masknet/plugin-wallet'
import { WalletRPC } from '../messages'
import { currentTokenPricesSettings } from '../settings'
import { ChainId, CurrencyType, getCoingeckoCoinId, getCoingeckoPlatformId } from '@masknet/web3-shared'

const task = pollingTask(
    async () => {
        await WalletRPC.kickToUpdateTokenPrices()
        return false
    },
    {
        autoStart: false,
        delay: UPDATE_CHAIN_STATE_DELAY,
    },
)
export function useTokenPrice(
    chainId: ChainId | undefined,
    contractAddress: string | undefined,
    currencyType: CurrencyType = CurrencyType.USD,
) {
    let platformId: string | undefined = undefined
    let coinId: string | undefined = undefined
    if (chainId) {
        platformId = getCoingeckoPlatformId(chainId)
        coinId = getCoingeckoCoinId(chainId)
    }

    const category = contractAddress || coinId

    const [price, setPrice] = useState(0)
    useEffect(() => {
        // start the polling task
        task.reset()
        return () => task.cancel()
    }, [])

    useEffect(() => {
        if (!category) return

        if (contractAddress && platformId) {
            WalletRPC.trackContract(platformId, contractAddress)
            WalletRPC.updateTokenPrices()
        }
        if (!contractAddress) {
            WalletRPC.trackNativeToken(category)
            WalletRPC.updateNativeTokenPrices()
        }
        return currentTokenPricesSettings.addListener((newVal) => {
            const value = newVal[category!]?.[currencyType] ?? 0
            setPrice(value)
        })
    }, [platformId, category, contractAddress])
    useEffect(() => {
        if (!category) return
        const currentTokenPrices = currentTokenPricesSettings.value
        setPrice(currentTokenPrices[category]?.[currencyType] ?? 0)
    }, [category, currencyType])

    if (!category) return 0
    return price
}

export function useNativeTokenPrice(chainId: ChainId | undefined, currencyType: CurrencyType = CurrencyType.USD) {
    return useTokenPrice(chainId, undefined, currencyType)
}
