import { useValueRef } from '@masknet/shared-base-ui'
import { ChainId, CurrencyType, getCoinGeckoCoinId, getCoinGeckoPlatformId } from '@masknet/web3-shared-evm'
import { useEffect, useMemo } from 'react'
import { WalletRPC } from '../messages'
import { currentTokenPricesSettings } from '../settings'

function watchPage(onShow: () => any, onHide: () => any) {
    onShow()
    window.addEventListener('pageshow', onShow)
    window.addEventListener('pagehide', onHide)
    return () => {
        onHide()
        window.removeEventListener('pageshow', onShow)
        window.removeEventListener('pagehide', onHide)
    }
}

export function useTokenPrice(
    chainId: ChainId | undefined,
    contractAddress: string | undefined,
    currencyType: CurrencyType = CurrencyType.USD,
) {
    let platformId: string | undefined = undefined
    let coinId: string | undefined = undefined
    if (chainId) {
        platformId = getCoinGeckoPlatformId(chainId)
        coinId = getCoinGeckoCoinId(chainId)
    }

    const category = (contractAddress || coinId)?.toLowerCase()

    const prices = useValueRef(currentTokenPricesSettings)
    const price = useMemo(() => {
        if (!category) return 0
        return prices[category]?.[currencyType] ?? 0
    }, [category, currencyType, prices])

    useEffect(() => {
        if (!contractAddress || !platformId) return
        return watchPage(
            () => WalletRPC.trackContract(platformId!, contractAddress),
            () => WalletRPC.decreaseTokenTracking(),
        )
    }, [platformId, contractAddress])

    useEffect(() => {
        if (contractAddress || !category) return
        return watchPage(
            () => WalletRPC.trackNativeToken(category),
            () => WalletRPC.decreaseNativeTokenTracking(),
        )
    }, [category, contractAddress])

    if (!category) return 0
    return price
}

export function useNativeTokenPrice(chainId: ChainId | undefined, currencyType: CurrencyType = CurrencyType.USD) {
    return useTokenPrice(chainId, undefined, currencyType)
}
