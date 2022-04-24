import type { TradeInfo } from '../../../types'
import { useMemo } from 'react'
import { isGreaterThan, isLessThan, multipliedBy } from '@masknet/web3-shared-base'
import { MINIMUM_AMOUNT } from '../../../constants'
import BigNumber from 'bignumber.js'
import { useNativeTokenPrice, useTokenPrice } from '../../../../Wallet/hooks/useTokenPrice'
import { ChainId, SchemaType, formatBalance, useNativeTokenDetailed } from '@masknet/web3-shared-evm'
import { AllProviderTradeContext } from '../../../trader/useAllProviderTradeContext'

export function useSortedTrades(traders: TradeInfo[], chainId: ChainId, gasPrice?: string) {
    const { value: nativeToken } = useNativeTokenDetailed(chainId)
    const nativeTokenPrice = useNativeTokenPrice(chainId)

    const {
        tradeState: [{ outputToken }],
    } = AllProviderTradeContext.useContainer()

    const outputTokenPrice = useTokenPrice(chainId, outputToken?.address.toLowerCase())

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

                        const gasFeeUSD = new BigNumber(formatBalance(gasFee ?? 0, nativeToken?.decimals)).times(
                            nativeTokenPrice,
                        )

                        const finalPrice = new BigNumber(
                            formatBalance(trade.value.outputAmount, outputToken.decimals, 2),
                        )
                            .times(outputToken.type !== SchemaType.Native ? outputTokenPrice : nativeTokenPrice)
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
