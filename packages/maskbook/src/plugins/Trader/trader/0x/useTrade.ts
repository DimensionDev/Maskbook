import { getEnumAsArray } from '@dimensiondev/kit'
import { NetworkType, FungibleTokenDetailed, isNative, useBlockNumber, useTokenConstants } from '@masknet/web3-shared'
import { difference } from 'lodash-es'
import { useAsyncRetry } from 'react-use'
import { ZRX_AFFILIATE_ADDRESS } from '../../constants'
import { PluginTraderRPC } from '../../messages'
import { TradeStrategy, ZrxTradePool } from '../../types'
import { useSlippageTolerance } from '../0x/useSlippageTolerance'
import { useTradeProviderSettings } from '../useTradeSettings'
import { currentNetworkSettings } from '../../../Wallet/settings'
import { safeUnreachable } from '@dimensiondev/kit'

export function setTokenNativeNetwork(networkType: NetworkType) {
    switch (networkType) {
        case NetworkType.Ethereum:
            return 'ETH'
        case NetworkType.Binance:
            return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        case NetworkType.Polygon:
            return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        case NetworkType.Arbitrum:
            return '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
        default:
            safeUnreachable(networkType)
            return ''
    }
}

export function useTrade(
    strategy: TradeStrategy,
    inputAmount: string,
    outputAmount: string,
    inputToken?: FungibleTokenDetailed,
    outputToken?: FungibleTokenDetailed,
) {
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const blockNumber = useBlockNumber()

    const slippage = useSlippageTolerance()
    const { pools } = useTradeProviderSettings()
    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (inputAmount === '0' && isExactIn) return null
        if (outputAmount === '0' && !isExactIn) return null

        const sellToken = isNative(inputToken.address)
            ? setTokenNativeNetwork(currentNetworkSettings.value)
            : inputToken.address
        const buyToken = isNative(outputToken.address)
            ? setTokenNativeNetwork(currentNetworkSettings.value)
            : outputToken.address
        return PluginTraderRPC.swapQuote(
            {
                sellToken,
                buyToken,
                sellAmount: isExactIn ? inputAmount : void 0,
                buyAmount: isExactIn ? void 0 : outputAmount,
                slippagePercentage: slippage,
                excludedSources: difference(
                    getEnumAsArray(ZrxTradePool).map((x) => x.value),
                    pools,
                ),
                affiliateAddress: ZRX_AFFILIATE_ADDRESS,
            },
            currentNetworkSettings.value,
        )
    }, [
        NATIVE_TOKEN_ADDRESS,
        strategy,
        inputAmount,
        outputAmount,
        inputToken?.address,
        outputToken?.address,
        slippage,
        pools.length,
        blockNumber, // refresh api each block
    ])
}
