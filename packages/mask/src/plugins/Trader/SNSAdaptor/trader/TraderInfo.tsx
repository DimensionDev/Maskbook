import { memo, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { TradeInfo } from '../../types/index.js'
import { createNativeToken, formatPercentage, formatUSD, formatWeiToEther } from '@masknet/web3-shared-evm'
import { resolveTradeProviderName } from '../../pipes.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { multipliedBy, formatBalance, ZERO } from '@masknet/web3-shared-base'
import { PluginTraderRPC } from '../../messages.js'
import { TradeProvider } from '@masknet/public-api'
import { useGreatThanSlippageSetting } from './hooks/useGreatThanSlippageSetting.js'
import { useChainId, useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { DefaultTraderPlaceholderUI, TraderInfoUI } from './components/TraderInfoUI.js'

export interface TraderInfoProps {
    trade: TradeInfo
    isBest?: boolean
    isFocus?: boolean
    gasPrice?: string
    onClick: () => void
}

export const TraderInfo = memo<TraderInfoProps>(({ trade, gasPrice, isBest, onClick, isFocus }) => {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    // #region refresh pools
    useAsyncRetry(async () => {
        // force update balancer's pools each time user enters into the swap tab
        if (trade.provider === TradeProvider.BALANCER) await PluginTraderRPC.updatePools(true, chainId)
    }, [trade.provider, chainId])
    // #endregion

    const nativeToken = createNativeToken(chainId)
    const { value: tokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })

    const gasFee = useMemo(() => {
        return trade.gas.value && gasPrice ? multipliedBy(gasPrice, trade.gas.value).integerValue().toFixed() : '0'
    }, [trade.gas?.value, gasPrice])

    const gasFeeValueUSD = useMemo(() => {
        if (!gasFee) return ZERO.toString()
        return formatUSD(formatWeiToEther(gasFee).times(tokenPrice))
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
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const nativeToken = createNativeToken(chainId)
    return <DefaultTraderPlaceholderUI nativeToken={nativeToken} />
})
