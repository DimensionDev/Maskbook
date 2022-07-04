import { memo, useMemo } from 'react'
import type { TradeInfo } from '../../types'
import { createNativeToken, formatPercentage, formatUSD, formatWeiToEther } from '@masknet/web3-shared-evm'
import { resolveTradeProviderName } from '../../pipes'
import { multipliedBy, NetworkPluginID, formatBalance } from '@masknet/web3-shared-base'
import { useAsyncRetry } from 'react-use'
import { PluginTraderRPC } from '../../messages'
import { TradeProvider } from '@masknet/public-api'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { useGreatThanSlippageSetting } from './hooks/useGreatThanSlippageSetting'
import { useNativeTokenPrice } from '@masknet/plugin-infra/web3'
import { DefaultTraderPlaceholderUI, TraderInfoUI } from './components/TraderInfoUI'

export interface TraderInfoProps {
    trade: TradeInfo
    isBest?: boolean
    isFocus?: boolean
    gasPrice?: string
    onClick: () => void
}

export const TraderInfo = memo<TraderInfoProps>(({ trade, gasPrice, isBest, onClick, isFocus }) => {
    const { targetChainId } = TargetChainIdContext.useContainer()

    // #region refresh pools
    useAsyncRetry(async () => {
        // force update balancer's pools each time user enters into the swap tab
        if (trade.provider === TradeProvider.BALANCER) await PluginTraderRPC.updatePools(true, targetChainId)
    }, [trade.provider, targetChainId])
    // #endregion

    const nativeToken = createNativeToken(targetChainId)
    const { value: tokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId: targetChainId })

    const gasFee = useMemo(() => {
        return trade.gas.value && gasPrice ? multipliedBy(gasPrice, trade.gas.value).integerValue().toFixed() : '0'
    }, [trade.gas?.value, gasPrice])

    const gasFeeValueUSD = useMemo(() => {
        if (!gasFee) return '0'
        return formatUSD(formatWeiToEther(gasFee).times(tokenPrice))
    }, [gasFee, tokenPrice])

    const isGreatThanSlippageSetting = useGreatThanSlippageSetting(trade.value?.priceImpact)

    if (!trade.value) return null

    return (
        <TraderInfoUI
            loading={trade.loading}
            providerName={resolveTradeProviderName(trade.provider)}
            onClick={onClick}
            balance={formatBalance(trade.value?.outputAmount ?? 0, trade.value?.outputToken?.decimals, 2)}
            gasFee={gasFee}
            gasFeeValueUSD={gasFeeValueUSD}
            nativeToken={nativeToken}
            isBest={isBest}
            isFocus={isFocus}
            isGreatThanSlippageSetting={isGreatThanSlippageSetting}
            priceImpact={formatPercentage(trade.value.priceImpact)}
        />
    )
})

export const DefaultTraderPlaceholder = memo(() => {
    const { targetChainId } = TargetChainIdContext.useContainer()
    const nativeToken = createNativeToken(targetChainId)
    return <DefaultTraderPlaceholderUI nativeToken={nativeToken} />
})
