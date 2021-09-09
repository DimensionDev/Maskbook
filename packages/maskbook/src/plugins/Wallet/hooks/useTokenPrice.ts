import { useEffect, useState } from 'react'
import { pollingTask } from '@masknet/shared'
import { UPDATE_CHAIN_STATE_DELAY } from '../constants'
import { WalletRPC } from '../messages'
import { currentTokenPricesSettings } from '../settings'
import { CurrencyType } from '@masknet/web3-shared'

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
    platform: string,
    contractAddress: string | undefined,
    currencyType: CurrencyType = CurrencyType.USD,
) {
    const category = contractAddress ?? platform
    const [price, setPrice] = useState(0)
    useEffect(() => {
        // emit an updating request immediately
        if (contractAddress) {
            WalletRPC.updateTokenPrices()
        } else {
            WalletRPC.updateNativeTokenPrices()
        }
    }, [contractAddress])
    useEffect(() => {
        // start the polling task
        task.reset()
        return () => task.cancel()
    }, [])
    useEffect(() => {
        if (contractAddress) {
            WalletRPC.trackContract(platform, contractAddress)
        } else {
            WalletRPC.trackNativeToken(platform)
        }
        return currentTokenPricesSettings.addListener((newVal) => {
            const value = newVal[category]?.[currencyType] ?? 0
            setPrice(value)
        })
    }, [platform, contractAddress])

    useEffect(() => {
        const currentTokenPrices = currentTokenPricesSettings.value
        setPrice(currentTokenPrices[category]?.[currencyType] ?? 0)
    }, [category])

    return price
}

export function useNativeTokenPrice(platform: string, currencyType: CurrencyType = CurrencyType.USD) {
    return useTokenPrice(platform, undefined, currencyType)
}
