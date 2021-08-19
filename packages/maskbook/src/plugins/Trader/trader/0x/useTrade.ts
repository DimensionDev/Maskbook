import { getEnumAsArray } from '@dimensiondev/kit'
import {
    FungibleTokenDetailed,
    isNative,
    isSameAddress,
    NetworkType,
    useBlockNumber,
    useNetworkType,
    useTokenConstants,
} from '@masknet/web3-shared'
import { difference } from 'lodash-es'
import { useAsyncRetry } from 'react-use'
import { ZRX_AFFILIATE_ADDRESS } from '../../constants'
import { PluginTraderRPC } from '../../messages'
import { TradeStrategy, ZrxTradePool } from '../../types'
import { useSlippageTolerance } from '../0x/useSlippageTolerance'
import { useTradeProviderSettings } from '../useTradeSettings'

function enableSwap(networkType: NetworkType, ether_address: string, sellToken: string, buyToken: string) {
    if (networkType === NetworkType.Polygon) {
        if (sellToken === 'ETH' || buyToken === 'ETH') return false
    }
    return !isSameAddress(sellToken, ether_address) && !isSameAddress(buyToken, ether_address)
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
    const networkType = useNetworkType()
    const slippage = useSlippageTolerance()
    const { pools } = useTradeProviderSettings()
    const { ETHER_ADDRESS } = useTokenConstants()

    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return null
        const isExactIn = strategy === TradeStrategy.ExactIn
        if (inputAmount === '0' && isExactIn) return null
        if (outputAmount === '0' && !isExactIn) return null
        const sellToken = isNative(inputToken.address) ? 'ETH' : inputToken.address
        const buyToken = isNative(outputToken.address) ? 'ETH' : outputToken.address
        if (!enableSwap(networkType, ETHER_ADDRESS ?? '', sellToken, buyToken)) return null
        return PluginTraderRPC.swapQuote(networkType, {
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
        })
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
        networkType,
        ETHER_ADDRESS,
    ])
}
