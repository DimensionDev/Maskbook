import { memo, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { TradeInfo } from '../../types/index.js'
import { type ChainId, formatWeiToEther } from '@masknet/web3-shared-evm'
import { resolveTradeProviderName } from '../../pipes.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { multipliedBy, formatBalance, ZERO, formatCurrency, formatPercentage } from '@masknet/web3-shared-base'
import { PluginTraderRPC } from '../../messages.js'
import { TradeProvider } from '@masknet/public-api'
import { useGreatThanSlippageSetting } from './hooks/useGreatThanSlippageSetting.js'
import { useChainContext, useNativeTokenPrice, useNetworkContext, useWeb3Others } from '@masknet/web3-hooks-base'
import { DefaultTraderPlaceholderUI, TraderInfoUI } from './components/TraderInfoUI.js'

export interface TraderInfoProps {
    trade: TradeInfo
    isBest?: boolean
    isFocus?: boolean
    gasPrice?: string
    onClick: () => void
}

export const TraderInfo = memo<TraderInfoProps>(({ trade, gasPrice, isBest, onClick, isFocus }) => {
    const { chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    const Others = useWeb3Others()
    // #region refresh pools
    useAsyncRetry(async () => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM)
            if (trade.provider === TradeProvider.BALANCER)
                // force update balancer's pools each time user enters into the swap tab
                await PluginTraderRPC.updatePools(true, chainId as ChainId)
    }, [trade.provider, chainId, pluginID])
    // #endregion

    // const nativeToken = createNativeToken(chainId)
    const nativeToken = Others.createNativeToken(chainId)
    const { value: tokenPrice = 0 } = useNativeTokenPrice(pluginID, { chainId })

    const gasFee = useMemo(() => {
        return trade.gas.value && gasPrice ? multipliedBy(gasPrice, trade.gas.value).integerValue().toFixed() : '0'
    }, [trade.gas?.value, gasPrice])

    const gasFeeValueUSD = useMemo(() => {
        if (!gasFee) return ZERO.toString()
        return formatCurrency(formatWeiToEther(gasFee).times(tokenPrice), 'USD', { onlyRemainTwoDecimal: true })
    }, [gasFee, tokenPrice])

    const isGreatThanSlippageSetting = useGreatThanSlippageSetting(trade.value?.priceImpact)

    if (!trade.value) return null

    return (
        <TraderInfoUI
            loading={trade.loading || trade.gas.loading}
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
    const { chainId } = useChainContext()
    const Others = useWeb3Others()
    const nativeToken = Others.createNativeToken(chainId)
    return <DefaultTraderPlaceholderUI nativeToken={nativeToken} />
})
