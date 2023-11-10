import { memo, useMemo } from 'react'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { formatWeiToEther } from '@masknet/web3-shared-evm'
import type { TraderAPI } from '@masknet/web3-providers/types'
import { multipliedBy, formatBalance, ZERO, formatCurrency, formatPercentage } from '@masknet/web3-shared-base'
import { useChainContext, useNativeTokenPrice, useNetworkContext, useWeb3Utils } from '@masknet/web3-hooks-base'
import { useGreatThanSlippageSetting } from './hooks/useGreatThanSlippageSetting.js'
import { DefaultTraderPlaceholderUI, TraderInfoUI } from './components/TraderInfoUI.js'
import { resolveTradeProviderName } from '../../helpers/index.js'

interface TraderInfoProps {
    trade: AsyncStateRetry<TraderAPI.TradeInfo>
    isBest?: boolean
    isFocus?: boolean
    gasPrice?: string
    onClick: () => void
}

export const TraderInfo = memo<TraderInfoProps>(({ trade, gasPrice, isBest, onClick, isFocus }) => {
    const { chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const Others = useWeb3Utils()

    // const nativeToken = createNativeToken(chainId)
    const nativeToken = Others.createNativeToken(chainId)
    const { data: tokenPrice = 0 } = useNativeTokenPrice(pluginID, { chainId })

    const gasFee = useMemo(() => {
        return trade.value?.gas && gasPrice
            ? multipliedBy(gasPrice, trade.value?.gas)
                .integerValue()
                .toFixed()
            : '0'
    }, [trade.value?.gas, gasPrice])

    const gasFeeValueUSD = useMemo(() => {
        if (!gasFee) return ZERO.toString()
        return formatCurrency(formatWeiToEther(gasFee).times(tokenPrice), 'USD', { onlyRemainTwoOrZeroDecimal: true })
    }, [gasFee, tokenPrice])

    const isGreatThanSlippageSetting = useGreatThanSlippageSetting(trade.value?.value?.priceImpact)

    if (!trade.value) return null

    return (
        <TraderInfoUI
            loading={trade.loading}
            providerName={resolveTradeProviderName(trade.value.provider)}
            onClick={onClick}
            balance={formatBalance(trade.value?.value?.outputAmount ?? 0, trade?.value.value?.outputToken?.decimals, {
                significant: 2,
            })}
            gasFee={gasFee}
            gasFeeValueUSD={gasFeeValueUSD}
            nativeToken={nativeToken}
            isBest={isBest}
            isFocus={isFocus}
            isGreatThanSlippageSetting={isGreatThanSlippageSetting}
            priceImpact={formatPercentage(trade.value?.value?.priceImpact ?? 0)}
        />
    )
})

export const DefaultTraderPlaceholder = memo(() => {
    const { chainId } = useChainContext()
    const Utils = useWeb3Utils()
    const nativeToken = Utils.createNativeToken(chainId)
    return <DefaultTraderPlaceholderUI nativeToken={nativeToken} />
})
