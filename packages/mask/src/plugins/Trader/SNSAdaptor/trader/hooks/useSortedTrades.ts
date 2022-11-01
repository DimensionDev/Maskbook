import { useMemo } from 'react'
import { NetworkPluginID } from '@masknet/shared-base'
import { isGreaterThan, isLessThan, multipliedBy, leftShift } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useFungibleToken, useFungibleTokenPrice, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { MINIMUM_AMOUNT } from '../../../constants/index.js'
import type { TradeInfo } from '../../../types/index.js'
import { AllProviderTradeContext } from '../../../trader/useAllProviderTradeContext.js'

export function useSortedTrades(traders: TradeInfo[], chainId: ChainId, gasPrice?: string) {
    const { value: nativeToken } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, '', undefined, { chainId })
    const { value: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })

    const {
        tradeState: [{ outputToken }],
    } = AllProviderTradeContext.useContainer()

    const { value: outputTokenPrice = 0 } = useFungibleTokenPrice(
        NetworkPluginID.PLUGIN_EVM,
        outputToken?.address.toLowerCase(),
        {
            chainId,
        },
    )

    return useMemo(() => {
        if (outputToken && nativeToken && (outputTokenPrice || nativeTokenPrice)) {
            return traders
                .map((trade) => {
                    if (
                        gasPrice &&
                        trade.value &&
                        isGreaterThan(trade.value.outputAmount, MINIMUM_AMOUNT) &&
                        trade.gas.value
                    ) {
                        const gasFee = multipliedBy(gasPrice, trade.gas.value).integerValue().toFixed()

                        const gasFeeUSD = leftShift(gasFee ?? 0, nativeToken?.decimals).times(nativeTokenPrice)

                        const finalPrice = leftShift(trade.value.outputAmount, outputToken.decimals)
                            .times(outputToken.schema !== SchemaType.Native ? outputTokenPrice : nativeTokenPrice)
                            .minus(gasFeeUSD)

                        return {
                            ...trade,
                            finalPrice,
                        }
                    }
                    return trade
                })
                .filter(({ value }) => !!value && !value.outputAmount.isZero())
                .sort(
                    (
                        { finalPrice: finalPriceA, gas: { value: gasA }, value: valueA },
                        { finalPrice: finalPriceB, gas: { value: gasB }, value: valueB },
                    ) => {
                        let a = finalPriceA
                        let b = finalPriceB

                        if (!gasA && gasB) {
                            return 1 // B goes first
                        } else if (gasA && !gasB) {
                            return -1 // A goes first
                        } else if (!gasA && !gasB) {
                            a = valueA?.outputAmount
                            b = valueB?.outputAmount
                        }
                        if (isGreaterThan(a ?? 0, b ?? 0)) return -1
                        if (isLessThan(a ?? 0, b ?? 0)) return 1
                        return 0
                    },
                )
        }
        return traders
            .filter(({ value }) => !!value && !value.outputAmount.isZero())
            .sort(({ value: a }, { value: b }) => {
                if (a?.outputAmount.isGreaterThan(b?.outputAmount ?? 0)) return -1
                if (a?.outputAmount.isLessThan(b?.outputAmount ?? 0)) return 1
                return 0
            })
    }, [traders, outputToken, gasPrice, outputTokenPrice, nativeTokenPrice, nativeToken])
}
