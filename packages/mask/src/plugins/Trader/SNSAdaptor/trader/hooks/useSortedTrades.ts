import { useMemo } from 'react'
import { isGreaterThan, isLessThan, multipliedBy, leftShift } from '@masknet/web3-shared-base'
import {
    useFungibleToken,
    useFungibleTokenPrice,
    useNativeTokenPrice,
    useNetworkContext,
    useWeb3State,
} from '@masknet/web3-hooks-base'
import { MINIMUM_AMOUNT } from '../../../constants/index.js'
import { AllProviderTradeContext } from '../../../trader/useAllProviderTradeContext.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { TraderAPI } from '@masknet/web3-providers/types'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'

export function useSortedTrades(
    traders: Array<AsyncStateRetry<TraderAPI.TradeInfo>>,
    chainId: Web3Helper.ChainIdAll,
    gasPrice?: string,
) {
    const { pluginID } = useNetworkContext()
    const { Others } = useWeb3State()
    const { value: nativeToken } = useFungibleToken(pluginID, '', undefined, { chainId })
    const { value: nativeTokenPrice = 0 } = useNativeTokenPrice(pluginID, { chainId })

    const {
        tradeState: [{ outputToken }],
    } = AllProviderTradeContext.useContainer()

    const { value: outputTokenPrice = 0 } = useFungibleTokenPrice(pluginID, outputToken?.address.toLowerCase(), {
        chainId,
    })

    return useMemo(() => {
        if (outputToken && nativeToken && (outputTokenPrice || nativeTokenPrice)) {
            return traders
                .map((trade) => {
                    if (
                        gasPrice &&
                        trade.value?.value &&
                        isGreaterThan(trade.value.value.outputAmount, MINIMUM_AMOUNT) &&
                        trade.value.gas
                    ) {
                        const gasFee = multipliedBy(gasPrice, trade.value.gas).integerValue().toFixed()

                        const gasFeeUSD = leftShift(gasFee ?? 0, nativeToken?.decimals).times(nativeTokenPrice)

                        const finalPrice = leftShift(trade.value.value.outputAmount, outputToken.decimals)
                            .times(
                                !Others?.isNativeTokenSchemaType(outputToken.schema)
                                    ? outputTokenPrice
                                    : nativeTokenPrice,
                            )
                            .minus(gasFeeUSD)

                        return {
                            ...trade,
                            value: {
                                ...trade.value,
                                finalPrice,
                            },
                        }
                    }
                    return trade
                })
                .filter(({ value }) => !!value && !value.value?.outputAmount.isZero())
                .sort((valueA, valueB) => {
                    let a = valueA.value?.finalPrice
                    let b = valueB.value?.finalPrice

                    const gasA = valueA.value?.gas
                    const gasB = valueB.value?.gas

                    if (!gasA && gasB) {
                        return 1 // B goes first
                    } else if (gasA && !gasB) {
                        return -1 // A goes first
                    } else if (!gasA && !gasB) {
                        a = valueA?.value?.value?.outputAmount
                        b = valueB?.value?.value?.outputAmount
                    }
                    if (isGreaterThan(a ?? 0, b ?? 0)) return -1
                    if (isLessThan(a ?? 0, b ?? 0)) return 1
                    return 0
                })
        }
        return traders
            .filter(({ value }) => !!value && !value.value?.outputAmount.isZero())
            .sort((valueA, valueB) => {
                if (valueA.value?.value?.outputAmount.isGreaterThan(valueB.value?.value?.outputAmount ?? 0)) return -1
                if (valueA.value?.value?.outputAmount.isLessThan(valueB.value?.value?.outputAmount ?? 0)) return 1
                return 0
            })
    }, [
        traders,
        outputToken,
        gasPrice,
        outputTokenPrice,
        nativeTokenPrice,
        nativeToken,
        Others?.isNativeTokenSchemaType,
    ])
}
